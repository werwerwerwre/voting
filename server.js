const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Шлях до файлу для збереження результатів голосування
const votesFilePath = path.join(__dirname, 'votes.json');

// Статичні файли
app.use(express.static(path.join(__dirname, 'public')));

// Парсинг JSON
app.use(express.json());

// Завантаження результатів голосування
const loadVotes = () => {
    if (fs.existsSync(votesFilePath)) {
        const data = fs.readFileSync(votesFilePath);
        return JSON.parse(data);
    }
    return { yes: 0, no: 0 };
};

// Збереження результатів голосування
const saveVotes = (votes) => {
    fs.writeFileSync(votesFilePath, JSON.stringify(votes, null, 2));
};

// Отримати результати голосування
app.get('/api/votes', (req, res) => {
    const votes = loadVotes();
    res.json(votes);
});

// Відповісти на голосування
app.post('/api/vote', (req, res) => {
    const { vote } = req.body;
    const votes = loadVotes();

    if (vote === 'yes') {
        votes.yes += 1;
    } else if (vote === 'no') {
        votes.no += 1;
    }

    saveVotes(votes);
    res.json(votes);
});

// Слухаємо на порту
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

