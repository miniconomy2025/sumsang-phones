import express, {Request, Response} from 'express';

const app = express();
const PORT = 5000;

app.get('/api/', (req: Request, res: Response) => {
    res.status(200).send('Test response');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})