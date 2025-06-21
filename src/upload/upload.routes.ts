import express, { Request, Response } from 'express';
import multer from 'multer';
import UploadController from './upload.controller';

const uploadRoute = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

uploadRoute.post('/', upload.single('file'),
    async (req: Request<{}, {}, {}>, res: Response<any>): Promise<any> => {
        try {
            if (!req.file) {
                return res.status(400).json({ status: false, message: 'No file uploaded', data: null });
            }
            const uploadController = new UploadController()
            const data = await uploadController.upload(req.file as Express.Multer.File);
    const { statusCode, ...responseData } = data;
             return res.status(statusCode).send({ ...responseData });
        } catch (error) {
            return res.status(500).json({ status: false, message: 'Upload failed', data: null });
        }
    });

export default uploadRoute;
