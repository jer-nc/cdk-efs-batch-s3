# CDK EFS Batch S3 Stack

This AWS CDK (Cloud Development Kit) project establishes an architecture to manage interactions among Amazon Elastic File System (EFS), AWS Batch, Amazon S3, and API Gateway Lambda functions.

This repository has been based on the project [aws-s3-efs-lambda](https://github.com/smislam/aws-s3-efs-lambda) by `smislam`.

## Overview

AWS Batch jobs dealing with multiple tasks (job arrays) and requiring large files typically download each file from S3 based on the task index in parallel. This incurs additional costs and slows down job execution.

By configuring EFS, a shared file system can be mounted with each job (container). This simplifies file access from the container via a local path, enhancing efficiency and reducing overhead in downloading files from S3.

> [!CAUTION]
>
> This is an experimental project. I am not an expert in systems or security. Currently, I'm researching cloud-based 3D rendering with AWS Batch and have decided to make this repository public so other developers can analyze and improve it for their own solutions.

## How it Works?

### Logic for copying files from S3 to EFS

![diagram-1](/assets/lambda-s3-efs.jpg)

This logic allows us to upload files to S3 and have a lambda function triggered on each upload to copy the file to EFS.

We do this to write content to EFS and subsequently visualize the files in AWS Batch jobs.

### Batch Logic:

![diagram-2](/assets/efs-batch.jpg)

This logic enables us to configure all aspects of AWS Batch to submit a job and mount an EFS volume in the job containers.

The container image comes from Docker Hub. It's a public image with a small bash script that lists the local path where the EFS has been mounted.

## Screenshots

### Upload Files to S3
![upload-files-to-s3](/assets/s3.png)

### List Files in EFS via API Gateway
![list-files-in-efs-via-api-gateway](/assets/api-endpoint.png)

### Submit Batch Job
![submit-batch-job](/assets/submit-batch-job.png)

## CloudWatch Logs
![cloudwatch-logs](/assets/cloudwatch-aws-batch.png)

## CloudWatch Job Array 0 & 1
| Index 0                               | Index 1                               |
| ------------------------------------- | ------------------------------------- |
| ![cloudwatch-job-1-2](/assets/j0.png) | ![cloudwatch-job-1-2](/assets/j1.png) |


## Resources

The main components of this stack include:

1. **VPC Setup**
   - Creating a Virtual Private Cloud (VPC) for isolating resources.

2. **Security Groups**
   - Defining security groups to control inbound and outbound traffic.

3. **EFS (Elastic File System) Configuration**
   - Setting up the EFS file system within the VPC for scalable file storage.

4. **Access Point**
   - Establishing an access point within the EFS to permit specific access to the file system.

5. **S3 Bucket**
   - Establishing an S3 bucket for storing files.

6. **Lambda Functions**
   - Implementing Lambda functions for file operations:
     - **Copy To EFS Function**: Moving files from S3 to EFS.
     - **List EFS Contents Function**: Listing files present in the EFS.

7. **API Gateway**
   - Setting up an API Proxy using Lambda to list files present in the EFS.

8. **AWS Batch Resources**
   - Configuring resources for AWS Batch:
     - Defining a job queue, compute environment, and job definition.

## Prerequisites

Before deploying this CDK stack, ensure you have:

- Appropriate AWS credentials set up.
- AWS CDK installed and configured.

## Deployment Steps

1. **Installation**
   ```
   npm install
   ```

2. **Deployment**
   ```
   cdk deploy
   ```

## Configuration

- **Constants**: Adjust constant values like `lambdaLocalMountPath` in the `CdkEfsBatchS3Stack` file to suit your requirements.

- **Customizations**: Modify function names, resource names, and other parameters within respective function calls as needed.

## Usage

Once deployed, the stack provides various functionalities:

- **File Transfer**: Files from S3 are moved to the configured EFS.
- **Listing Files**: Access the API endpoint to list files present in the EFS.

## Cleanup

To remove the deployed stack and associated resources:

```
cdk destroy
```