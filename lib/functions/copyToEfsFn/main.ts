import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Context, Handler, S3Event } from "aws-lambda";
import { writeFileSync } from "fs";
import path = require("path");

export const handler: Handler = async (event: S3Event, context: Context): Promise<any> => {
    const efsPath = process.env.EFS_PATH!;

    const s3Client = new S3Client({});

    await new Promise(function (resolve, reject) {
        event.Records.forEach(async (record) => {
            const bucketName = record.s3.bucket.name;
            const key = record.s3.object.key.replace(/\+/g, " ");
            const params = {
                Bucket: bucketName,
                Key: key,
            };

            try {
                const data = await s3Client.send(new GetObjectCommand(params));
                console.log(data);
                if (data.Body != undefined) {
                    console.log(data.Body);
                    const bytes = await data.Body.transformToByteArray();
                    writeFileSync(path.join(efsPath, key), bytes);
                    console.log(`Successfully uploaded data to ${efsPath}/${key}`)
                } else {
                    console.log("Body is undefined");
                }
            } catch (err) {
                console.log(err);
                reject(err);
            }
        });
    });
};