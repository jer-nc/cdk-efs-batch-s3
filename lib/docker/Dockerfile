FROM public.ecr.aws/docker/library/ubuntu:22.04

# Install dependencies
RUN apt-get update -y && \
    apt-get install -y \
    sudo \
    curl \
    ca-certificates \
    zip \
    xz-utils \
    python3 \
    python3-pip \
    tree 

# Download and install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    sudo ./aws/install && \
    rm ./aws/install

# docker build -t check_efs:latest .
# docker tag check_efs rejnc/check_efs:latest
# docker push rejnc/check_efs:latest

RUN pip3 install boto3
RUN pip install requests

# Copy script to container image
COPY check_efs.sh /usr/local/bin/check_efs.sh

# Make script executable
RUN chmod +x /usr/local/bin/check_efs.sh

# Command to run when container starts
CMD ["/usr/local/bin/check_efs.sh"]