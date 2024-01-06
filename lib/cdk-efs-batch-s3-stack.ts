import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createVpc } from './vpc/vpc';
import { createSg } from './vpc/sg';
import { createFileSystem } from './efs/fileSystem';
import { InterfaceVpcEndpointAwsService, Port } from 'aws-cdk-lib/aws-ec2';
import { createAccessPoint } from './efs/accessPoint';
import { createS3Bucket } from './s3/s3Bucket';
import { createCopyToEfsFn } from './functions/copyToEfsFn/construct';
import { createListContentsFn } from './functions/listEfsContentsFn/construct';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { createBatchResources } from './batch/batchResources';

export class CdkEfsBatchS3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Constants:

    const lambdaLocalMountPath = '/mnt/files';

    // 1. Create VPC
    const vpc = createVpc(this, {
      name: 'cdk-efs-batch-s3-vpc',
      gatewayEndpointName: 'cdk-efs-batch-s3-vpc-gw',
    });

    // 2. Create security group
    const sg = createSg(this, {
      name: 'cdk-efs-batch-s3-sg',
      vpc: vpc,
    });

    // // 2.1. Add interface endpoint to EFS
    vpc.addInterfaceEndpoint('vpc-interface-endpoint-efs', {
      service: InterfaceVpcEndpointAwsService.ELASTIC_FILESYSTEM,
      securityGroups: [sg],
      privateDnsEnabled: true,
    });

    // // 3. Create EFS file system
    const efs = createFileSystem(this, {
      name: 'cdk-efs-batch-s3-efs',
      vpc: vpc,
      sg: sg,
    });

    // // 4. Create access point
    const accessPoint = createAccessPoint(this, {
      name: 'cdk-efs-batch-s3-access-point',
      efs: efs,
      // path: '/efs/lambda',
      path: '/lambda',
    });

    // // 5. Create S3 bucket
    const s3Bucket = createS3Bucket(this, {
      name: 'cdk-efs-batch-s3-bucket-demo',
    });

    // // 6. Create Lambda function (triggered by S3) to write files to EFS

    const copyToEfsFn = createCopyToEfsFn(this, {
      name: 's3-copy-to-efs-fn',
      lambdaLocalMountPath: lambdaLocalMountPath,
      vpc: vpc,
      accessPoint: accessPoint,
      s3bucket: s3Bucket,
      efs: efs,
    });

    // Review: TODO
    s3Bucket.grantReadWrite(copyToEfsFn);

    efs.connections.allowDefaultPortFrom(copyToEfsFn);
    efs.connections.allowFrom(sg, Port.tcp(2049));


    // 7. Create Lambda function to list files in EFS

    const listEfsContentsFn = createListContentsFn(this, {
      name: 'list-efs-contents-fn',
      lambdaLocalMountPath: lambdaLocalMountPath,
      vpc: vpc,
      accessPoint: accessPoint,
      efs: efs,
    });

    // 8. Create API Proxy for Lambda function to list files in EFS

    const api = new LambdaRestApi(this, 'cdk-efs-batch-s3-api', {
      handler: listEfsContentsFn,
    });

    // 9. Batch Resources

    const batchResources = createBatchResources(this, {
      vpc: vpc,
      sg: sg,
      efs: efs,
      dockerBaseImage: 'rejnc/check_efs:latest', 
      jobQueueName: 'job-queue-efs-demo',
      computeEnvName: 'compute-env-efs-demo',
      jobDefinitionName: 'job-definition-efs-demo',
    });


  }
}
