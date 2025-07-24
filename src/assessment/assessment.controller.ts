import { Get, Body, Path, Post, Query, Route, Tags } from 'tsoa';
import Question from './model/questions.model';
import { CreateQuestionDto } from './types/dto.types';

@Tags('Assessment')
@Route('api/v1/assessment')
export default class AssessmentController {
    @Get("/{category}")
    public async getAssessment(@Path() category: 'Assessment' | 'Questionnaire') {
        try {
            const data = await Question.find({category});
            return {
                statusCode: 200,
                status: true,
                message: 'Assessments retrieved successfully',
                data
            };
        } catch (error: any) {
            return {
                status: false,
                statusCode: 500,
                message: error.message || 'Internal Server Error',
                data: null
            }
        }
    }

    @Post("/")
    public async createAssessment( @Body() createQuestionDto: CreateQuestionDto[]) {
        try {
            await Question.insertMany(createQuestionDto)
            return {
                statusCode: 200,
                status: true,
                message: 'Assessments submitted successfully',
            };
        } catch (error: any) {
            return {
                status: false,
                statusCode: 500,
                message: error.message || 'Internal Server Error',
                data: null
            }
        }
    }

}
