import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GoalDecomposer } from '../services/aiCoach/GoalDecomposer';
import { syncGoalsToCloud } from '../services/supabase';
import { env } from '../utils/env';

export function WidgetDetailModal({ widget, t, onClose, onUpdateGoal }) {
    // widget now contains { ...dashboardConfigItem, ...goalData }
    const [localTitle, setLocalTitle] = useState(widget.title || t(widget.name));
    const [goalInput, setGoalInput] = useState({ title: '', category: '' });
    const [aiSteps, setAiSteps] = useState(widget.steps || []);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const hasKey = !!(localStorage.getItem('user_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || (env && env.GEMINI_API_KEY));


    // AI Conversation State
    const [conversationState, setConversationState] = useState('initial'); // 'initial', 'clarifying', 'interview', 'success'
    const [aiQuestion, setAiQuestion] = useState('');
    const [tempGoalContext, setTempGoalContext] = useState('');
    const [interviewQuestions, setInterviewQuestions] = useState([]);
    const [interviewAnswers, setInterviewAnswers] = useState({}); // { 0: "Answer 1" }

    // PROJECT WIDGET STATE
    const [projectTab, setProjectTab] = useState('work'); // 'work', 'finance', 'access'
    const [financeData, setFinanceData] = useState(widget.finance || { income: [], expense: [] });
    const [teamData, setTeamData] = useState(widget.team || []);

    const handleFinanceAdd = (type, amount, desc) => {
        const newItem = { id: Date.now(), amount: parseFloat(amount), desc };
        const newData = { ...financeData, [type]: [...financeData[type], newItem] };
        setFinanceData(newData);
        if (onUpdateGoal) onUpdateGoal({ category: widget.id, finance: newData });
        syncGoalsToCloud([{ category: widget.id, finance: newData }]);
    };

    const handleFinanceRemove = (type, id) => {
        const newData = { ...financeData, [type]: financeData[type].filter(i => i.id !== id) };
        setFinanceData(newData);
        if (onUpdateGoal) onUpdateGoal({ category: widget.id, finance: newData });
        syncGoalsToCloud([{ category: widget.id, finance: newData }]);
    };

    const calculateProfit = () => {
        const inc = financeData.income.reduce((acc, i) => acc + i.amount, 0);
        const exp = financeData.expense.reduce((acc, i) => acc + i.amount, 0);
        return inc - exp;
    };


    const handleTitleChange = (e) => {
        const val = e.target.value;
        setLocalTitle(val);
    };

    const handleTitleBlur = () => {
        if (onUpdateGoal) {
            onUpdateGoal({ category: widget.id, title: localTitle }); // Optimistic
            syncGoalsToCloud([{ category: widget.id, title: localTitle, steps: aiSteps }]); // Cloud
        }
    };

    const calculateProgress = () => {
        if (!aiSteps.length) return 0;
        const tasks = aiSteps.filter(s => !s.isHeader);
        if (!tasks.length) return 0;
        const completed = tasks.filter(s => s.completed).length;
        return Math.round((completed / tasks.length) * 100);
    };

    const persistChanges = (newSteps) => {
        setAiSteps(newSteps);
        if (onUpdateGoal) {
            onUpdateGoal({ category: widget.id, steps: newSteps, finance: financeData, team: teamData }); // Optimistic
            syncGoalsToCloud([{ category: widget.id, title: localTitle, steps: newSteps, finance: financeData, team: teamData }]); // Cloud
        }
    };

    const handleAIBreakdown = async () => {
        if (!goalInput.title && conversationState !== 'interview') return;
        setIsLoadingAI(true);
        try {
            let result;

            if (conversationState === 'initial') {
                setTempGoalContext(goalInput.title);
                result = await GoalDecomposer.clarifyGoal(goalInput.title, `Category: ${widget.id}`);
            } else if (conversationState === 'clarifying') {
                const combinedContext = `Original Goal: "${tempGoalContext}". AI Question: "${aiQuestion}". User Answer: "${goalInput.title}".`;
                result = await GoalDecomposer.clarifyGoal(combinedContext, `Category: ${widget.id}`);
            } else if (conversationState === 'interview') {
                const qaPairs = interviewQuestions.map((q, i) => `${q} ${interviewAnswers[i] || ''}`).join(". ");
                const combinedContext = `Original Goal: "${tempGoalContext}". Context: ${qaPairs}`;
                result = await GoalDecomposer.clarifyGoal(combinedContext, `Category: ${widget.id}`);
            }

            if (result.type === 'question') {
                setAiQuestion(result.question);
                setConversationState('clarifying');
                setGoalInput(prev => ({ ...prev, title: '' }));
            } else if (result.type === 'interview') { // New Interview Mode
                setInterviewQuestions(result.questions || []);
                setConversationState('interview');
            } else if (result.type === 'steps' || result.steps) {
                const stepsRaw = result.steps || [];
                let steps = [];

                // Fix for single string response bug
                if (stepsRaw.length === 1 && stepsRaw[0].title && stepsRaw[0].title.includes('\n')) {
                    steps = stepsRaw[0].title.split('\n').filter(s => s.trim()).map(s => ({ title: s.replace(/^-\s*/, '').trim(), completed: false, isHeader: false }));
                } else {
                    steps = stepsRaw.map(s => ({ title: s.title || s, completed: false, isHeader: s.isHeader || false }));
                }

                setConversationState('success');
                persistChanges(steps);
            }
        } catch (e) {
            console.error("AI Error:", e);
            alert(`AI Error: ${e.message || "Unknown error"}`);
        } finally {
            setIsLoadingAI(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 5000,
                background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(30px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '2rem'
            }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '400px', padding: '32px 24px',
                    background: 'white', borderRadius: '40px', textAlign: 'center',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.1)', overflowY: 'auto', maxHeight: '90vh',
                    display: 'flex', flexDirection: 'column', gap: '20px'
                }}
            >

                {widget.id === 'projects' ? (
                    // PROJECT WIDGET UI
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: 900 }}>{t('nav.projects')}</h2>

                        {/* TABS */}
                        <div style={{ display: 'flex', gap: '8px', padding: '16px 0', borderBottom: '1px solid #eee' }}>
                            {['work', 'finance', 'access'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setProjectTab(tab)}
                                    style={{
                                        padding: '8px 16px', borderRadius: '12px', border: 'none',
                                        background: projectTab === tab ? '#007AFF' : '#f5f5f7',
                                        color: projectTab === tab ? 'white' : '#666', fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* WORK TAB */}
                        {projectTab === 'work' && (
                            <div style={{ flex: 1, overflowY: 'auto', marginTop: '16px', textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <input
                                        placeholder="Add new task..."
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && e.target.value) {
                                                const newStep = { title: e.target.value, completed: false };
                                                persistChanges([...aiSteps, newStep]);
                                                e.target.value = '';
                                            }
                                        }}
                                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                {aiSteps.map((step, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <input
                                            type="checkbox"
                                            checked={step.completed}
                                            onChange={() => {
                                                const newSteps = [...aiSteps];
                                                newSteps[i].completed = !newSteps[i].completed;
                                                persistChanges(newSteps);
                                            }}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                        <span style={{ textDecoration: step.completed ? 'line-through' : 'none' }}>{step.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* FINANCE TAB */}
                        {projectTab === 'finance' && (
                            <div style={{ flex: 1, overflowY: 'auto', marginTop: '16px', textAlign: 'left' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', padding: '16px', background: '#f5f5f7', borderRadius: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#666' }}>Profit</div>
                                        <div style={{ fontSize: '24px', fontWeight: 900, color: calculateProfit() >= 0 ? '#34C759' : '#FF3B30' }}>
                                            ${calculateProfit()}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    <button onClick={() => {
                                        const amt = prompt("Amount?");
                                        const desc = prompt("Description?");
                                        if (amt && desc) handleFinanceAdd('income', amt, desc);
                                    }} style={{ flex: 1, padding: '12px', background: '#34C759', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700 }}>+ Income</button>
                                    <button onClick={() => {
                                        const amt = prompt("Amount?");
                                        const desc = prompt("Description?");
                                        if (amt && desc) handleFinanceAdd('expense', amt, desc);
                                    }} style={{ flex: 1, padding: '12px', background: '#FF3B30', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700 }}>- Expense</button>
                                </div>

                                <h4 style={{ fontSize: '12px', color: '#666', marginTop: '16px' }}>History</h4>
                                {[...financeData.income.map(i => ({ ...i, type: 'inc' })), ...financeData.expense.map(i => ({ ...i, type: 'exp' }))]
                                    .sort((a, b) => b.id - a.id)
                                    .map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                            <span>{item.desc}</span>
                                            <span style={{ color: item.type === 'inc' ? '#34C759' : '#FF3B30', fontWeight: 700 }}>
                                                {item.type === 'inc' ? '+' : '-'}${item.amount}
                                            </span>
                                        </div>
                                    ))
                                }
                            </div>
                        )}

                        {/* ACCESS TAB */}
                        {projectTab === 'access' && (
                            <div style={{ flex: 1, overflowY: 'auto', marginTop: '16px', textAlign: 'left' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Team Access</h3>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                    <input
                                        id="invite-email"
                                        placeholder="Colleague Email"
                                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}
                                    />
                                    <button
                                        onClick={() => {
                                            const email = document.getElementById('invite-email').value;
                                            if (email) {
                                                const newTeam = [...teamData, { email, role: 'member' }];
                                                setTeamData(newTeam);
                                                if (onUpdateGoal) onUpdateGoal({ category: widget.id, team: newTeam });
                                                syncGoalsToCloud([{ category: widget.id, team: newTeam }]);
                                                document.getElementById('invite-email').value = '';
                                            }
                                        }}
                                        style={{ padding: '0 16px', background: '#007AFF', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700 }}
                                    >
                                        Invite
                                    </button>
                                </div>
                                <div style={{ marginTop: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#007AFF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>ME</div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>You</div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>Owner</div>
                                        </div>
                                    </div>
                                    {teamData.map((member, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ddd', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                                {member.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{member.email}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>{member.role || 'Member'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* 1. EDITABLE WIDGET TITLE & PROGRESS */}

                        <div>
                            <input
                                value={localTitle}
                                onChange={handleTitleChange}
                                onBlur={handleTitleBlur}
                                style={{
                                    fontSize: '24px', fontWeight: 900, border: 'none', background: 'transparent',
                                    textAlign: 'center', width: '100%', outline: 'none', color: '#1d1d1f'
                                }}
                            />
                            {aiSteps.length > 0 && (
                                <div style={{ height: '4px', background: '#f5f5f7', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${calculateProgress()}%`, background: '#34C759', transition: 'width 0.5s' }} />
                                </div>
                            )}
                        </div>

                        {/* 2. DYNAMIC CONTENT AREA */}
                        {conversationState !== 'success' && aiSteps.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                {/* Interview Mode */}
                                {conversationState === 'interview' && (
                                    <div style={{ textAlign: 'left' }}>
                                        <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>Battle Plan</h3>
                                        {interviewQuestions.map((q, i) => (
                                            <div key={i} style={{ marginBottom: '12px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#888' }}>{q}</label>
                                                <input
                                                    value={interviewAnswers[i] || ''}
                                                    onChange={e => setInterviewAnswers({ ...interviewAnswers, [i]: e.target.value })}
                                                    style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#f5f5f7', border: 'none', marginTop: '4px' }}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={handleAIBreakdown}
                                            style={{ width: '100%', padding: '12px', background: '#007AFF', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700 }}
                                        >
                                            Build Plan
                                        </button>
                                    </div>
                                )}

                                {/* Standard Initial/Clarifying Mode */}
                                {conversationState !== 'interview' && (
                                    <>
                                        {conversationState === 'clarifying' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                style={{
                                                    background: '#007AFF', color: 'white', padding: '16px',
                                                    borderRadius: '20px 20px 20px 4px', fontSize: '14px', fontWeight: 600,
                                                    lineHeight: '1.4', textAlign: 'left', alignSelf: 'flex-start'
                                                }}
                                            >
                                                {aiQuestion}
                                            </motion.div>
                                        )}

                                        <input
                                            autoFocus
                                            placeholder={conversationState === 'clarifying' ? (t('ai.answer_placeholder') || "Answer here...") : (t('common.placeholder_goal') || "What is your goal?")}
                                            value={goalInput.title}
                                            onChange={e => setGoalInput({ ...goalInput, title: e.target.value })}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAIBreakdown(); }}
                                            style={{
                                                width: '100%', padding: '16px', borderRadius: '20px',
                                                border: '1px solid rgba(0,0,0,0.1)', background: '#f5f5f7',
                                                fontSize: '16px', fontWeight: 500, outline: 'none',
                                                transition: 'all 0.2s ease'
                                            }}
                                        />

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={handleAIBreakdown}
                                                disabled={isLoadingAI || !goalInput.title}
                                                style={{
                                                    flex: 1, padding: '16px', borderRadius: '20px',
                                                    background: '#1d1d1f', color: 'white', border: 'none',
                                                    fontWeight: 700, fontSize: '18px', cursor: 'pointer',
                                                    opacity: isLoadingAI || !goalInput.title ? 0.5 : 1,
                                                    transition: 'opacity 0.2s',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                {isLoadingAI ? "⏳" : (conversationState === 'clarifying' ? "💬" : "✨")}
                                            </button>

                                            {/* Manual Add Button */}
                                            <button
                                                onClick={() => {
                                                    if (!goalInput.title) return;
                                                    const newStep = { title: goalInput.title, completed: false, isHeader: false };
                                                    persistChanges([...aiSteps, newStep]);
                                                }}
                                                disabled={isLoadingAI || !goalInput.title}
                                                style={{
                                                    width: '50px', padding: '0', borderRadius: '20px',
                                                    background: '#F2F2F7', color: '#007AFF', border: 'none',
                                                    fontWeight: 700, fontSize: '24px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </>
                                )}

                                {!hasKey && (
                                    <div style={{ marginTop: '10px', padding: '10px', background: 'var(--bg-card)', borderRadius: '12px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AI Key missing. <br />Enter key in Settings to unlock auto-breakdown.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {(conversationState === 'success' || aiSteps.length > 0) && (
                            <div style={{ textAlign: 'left', background: '#F2F2F7', padding: '20px', borderRadius: '24px' }}>
                                <h3 style={{ fontSize: '11px', fontWeight: 900, color: '#007AFF', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {t('ai.plan') || "ACTION PLAN"}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {aiSteps.map((step, i) => (
                                        step.isHeader ? (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                                style={{ marginTop: '16px', marginBottom: '4px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '4px' }}
                                            >
                                                <h4 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: '#8e8e93', letterSpacing: '0.05em', margin: 0 }}>
                                                    {step.title}
                                                </h4>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={step.completed}
                                                    onChange={() => {
                                                        const newSteps = [...aiSteps];
                                                        newSteps[i].completed = !newSteps[i].completed;
                                                        persistChanges(newSteps);
                                                    }}
                                                    style={{ width: '20px', height: '20px', accentColor: '#007AFF', marginTop: '2px' }}
                                                />
                                                <span style={{ fontSize: '15px', fontWeight: 500, color: step.completed ? '#999' : '#1d1d1f', textDecoration: step.completed ? 'line-through' : 'none', lineHeight: '1.4' }}>
                                                    {step.title || step}
                                                </span>
                                            </motion.div>
                                        )
                                    ))}
                                </div>
                                <button
                                    onClick={onClose}
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: '18px',
                                        background: '#007AFF', color: 'white', border: 'none',
                                        fontWeight: 800, fontSize: '14px', cursor: 'pointer', marginTop: '24px'
                                    }}
                                >
                                    {t('common.done') || "DONE"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
