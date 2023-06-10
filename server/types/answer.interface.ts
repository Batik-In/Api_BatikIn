export interface IQuestionAnswer {
    id?: number;
    questionId: number;
    content: string;
    explanation: string;
    isCorrect: boolean;
}