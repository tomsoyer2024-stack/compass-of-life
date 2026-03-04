import fs from 'fs';

const apikey = 'AIzaSyAdm0mLzE7ToU9pZQp_NgpcPgxL5KrtyZs';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apikey}`;

const body = {
    system_instruction: {
        parts: [{ text: "You are a coach" }]
    },
    contents: [{
        parts: [{ text: "hello" }]
    }],
    tools: [{
        google_search: {}
    }]
};

async function test() {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
