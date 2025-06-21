import { ErrorInterface } from "../global/interface/error.interface";
import { Controller, Post, Route, SuccessResponse, Tags, Response, UploadedFile } from "tsoa";
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';


@Tags('Upload')
@Route('api/v1/upload')
export default class UploadController extends Controller {
    @SuccessResponse('200', 'File uploaded successfully')
    @Response<ErrorInterface>('400', 'Bad Request')
    @Response<ErrorInterface>('500', 'Internal Server Error')
    @Post()
    public async upload(
        @UploadedFile() file: Express.Multer.File
    ) {
        try {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });
            const streamUpload = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { resource_type: 'auto' },
                        (error: any, result: any) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    streamifier.createReadStream(file.buffer).pipe(stream);
                });
            };
            const result = await streamUpload();
            return {
                statusCode: 200,
                status: true,
                message: "File uploaded successfully'",
                data: result
            };
        } catch (error) {
            return {
                statusCode: 200,
                status: true,
                message: "Internal server error'",
                data: null
            };

        }

    }
}