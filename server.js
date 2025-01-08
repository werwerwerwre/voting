const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Імпортуємо cors

// Створення сервера
const app = express();

// Додаємо middleware для CORS
app.use(cors());

// Підключення middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // обслуговуємо статичні файли з папки 'public')

// Шлях до JSON файлу для зберігання голосів
const votesFilePath = path.join(__dirname, 'votes.json');

// Отримання поточного результату голосування
app.get('/votes', (req, res) => {
    fs.readFile(votesFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Не вдалося зчитати дані з файлу' });
        }

        const votesData = JSON.parse(data);
        res.json(votesData.voteCount);
    });
});

// Голосування
app.post('/vote', (req, res) => {
    const { vote, ip } = req.body;

    // Зчитуємо поточні дані з JSON файлу
    fs.readFile(votesFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Не вдалося зчитати дані з файлу' });
        }

        const votesData = JSON.parse(data);

        // Перевірка, чи користувач вже проголосував
        const existingVote = votesData.votes.find(voteRecord => voteRecord.ip === ip);
        if (existingVote) {
            return res.status(400).json({ message: 'Ви вже проголосували!' });
        }

        // Додаємо новий голос до масиву
        votesData.votes.push({ ip, vote });

        // Оновлюємо підсумки голосування
        if (vote === 'yes') {
            votesData.voteCount.yes++;
        } else if (vote === 'no') {
            votesData.voteCount.no++;
        }

        // Записуємо оновлені дані назад у файл
        fs.writeFile(votesFilePath, JSON.stringify(votesData, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Не вдалося записати дані в файл' });
            }
            res.json({ message: 'Ваш голос зараховано!' });
        });
    });
});

// Запуск сервера
const port = 3000;
app.listen(port, () => {
    console.log(`Сервер запущено на порту ${port}`);
});
