import express, { Request, Response } from 'express';
import AssessmentController from './assessment.controller';
import { createQuestionValidation } from './types/validation.schema';
import { validateRequest } from '../middleware/validation';
import { CreateQuestionDto } from './types/dto.types';

const assessmentRoute = express.Router();

assessmentRoute.post('/', validateRequest(createQuestionValidation), 
async (req: Request<{}, {}, CreateQuestionDto[]>, res: Response<any>): Promise<any> => {
    const assessmentService = new AssessmentController();
    const data = await assessmentService.createAssessment(req.body);
    const { statusCode, ...responseData } = data;
    return res.status(statusCode).send({ ...responseData });
});

assessmentRoute.get('/:category', async (req: Request<{category: 'Assessment' | 'Questionnaire'}, {}, {}>, res: Response<any>): Promise<any> => {
    const assessmentService = new AssessmentController();
    const data = await assessmentService.getAssessment(req.params.category);
    const { statusCode, ...responseData } = data;
    return res.status(statusCode).send({ ...responseData });
});

assessmentRoute.get('/:subject/:gradeClass', async (req: Request<{subject: string, gradeClass: string }, {}, {}>, res: Response<any>): Promise<any> => {
    const assessmentService = new AssessmentController();
    const data = await assessmentService.getQuestions(req.params.subject, req.params.gradeClass);
    const { statusCode, ...responseData } = data;
    return res.status(statusCode).send({ ...responseData });
});

export default assessmentRoute;