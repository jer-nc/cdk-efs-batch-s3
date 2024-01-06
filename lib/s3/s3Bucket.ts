import { RemovalPolicy } from "aws-cdk-lib";
import { BlockPublicAccess, Bucket, BucketEncryption, IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

interface s3BucketProps {
    name: string;
}

export function createS3Bucket(scope: Construct, props: s3BucketProps) : Bucket {
    
    const bucket = new Bucket(scope, props.name, {
        bucketName: props.name,
        removalPolicy: RemovalPolicy.DESTROY,
        encryption: BucketEncryption.S3_MANAGED,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    return bucket;
}