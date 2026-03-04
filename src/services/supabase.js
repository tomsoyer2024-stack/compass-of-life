import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Goals & Steps Helpers
export const syncGoalsToCloud = async (goals) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const goalsWithUser = goals.map(g => ({
        id: g.id || crypto.randomUUID(),
        user_id: user.id,
        title: g.title,
        category: g.category || 'General',
        steps: g.steps || [],
        finance: g.finance || { income: [], expense: [] },
        team: g.team || [],
        created_at: g.createdAt || new Date().toISOString()
    }));

    const { data, error } = await supabase
        .from('goals')
        .upsert(goalsWithUser)
        .select();

    if (error) console.error('Error syncing goals:', error);
    return data;
};

// Widget Positions Helpers
export const syncWidgetPositions = async (positions) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const payload = Object.entries(positions).map(([id, pos]) => ({
        user_id: user.id,
        widget_id: id,
        x: String(pos.x),
        y: String(pos.y),
        width: String(pos.width || '100'),
        height: String(pos.height || '100'),
        shape: pos.shape || '24px'
    }));

    const { error } = await supabase
        .from('widget_positions')
        .upsert(payload);

    if (error) console.error('Error syncing positions:', error);
};
