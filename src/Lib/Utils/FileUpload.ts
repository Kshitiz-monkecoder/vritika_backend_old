import { PutObjectCommand, type PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3"
import multer, { type Multer } from "multer"
import { v4 as uuidv4 } from "uuid"

const BucketName: string = "db-power"
const BucketRegion: string = "ap-south-1"

/**
 * Uploads a buffer to an Amazon S3 bucket.
 *
 * @param {Buffer} buffer - The buffer to be uploaded.
 * @param {string} mimetype - The mimetype (fileMata) add file mata.
 * @param {string | null} folderName - Optional folder name within the bucket. Defaults to null.
 * @returns {Promise<void>} A promise that resolves when the upload is complete.
 */

export const UploadToS3 = async (buffer: Buffer, mimetype: any, folderName: string | null = null): Promise<any> => {
	const s3 = new S3Client({
		// forcePathStyle: false,
		// endpoint,
		credentials: {
			accessKeyId: "AKIA6GBMGGDREOPTYFYU",
			secretAccessKey: "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"
		},
		region: BucketRegion
	})

	const NewKey = uuidv4() + "." + mimetype.split("/")[1]
	const params: PutObjectCommandInput = {
		Bucket: BucketName,
		Key: `${folderName}/${NewKey}`,
		Body: buffer,
		ACL: "public-read",
		ContentType: mimetype,
		Metadata: {
			"Content-Type": mimetype
		}
	}

	const command = new PutObjectCommand(params)

	return { ...await s3.send(command), link: `https://${BucketName}.s3.${BucketRegion}.amazonaws.com/${params.Key}` }
	// return await s3.upload(params).promise();
}

const storage = multer.memoryStorage()

export const UploadMulter: Multer = multer({
	// dest: 'uploads/'
	storage
})
