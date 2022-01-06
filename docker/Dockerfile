FROM centos:8
RUN dnf install -y epel-release && yum -y update
RUN rpm --import https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc && \
  rpm --import https://packagecloud.io/rabbitmq/erlang/gpgkey && \
  rpm --import https://packagecloud.io/rabbitmq/rabbitmq-server/gpgkey
COPY rabbitmq/rabbitmq.repo /etc/yum.repos.d/
RUN yum update -y && yum makecache -y --disablerepo='*' --enablerepo='rabbitmq_erlang' --enablerepo='rabbitmq_server'
RUN yum install -y socat logrotate
RUN yum install -y --repo rabbitmq_erlang --repo rabbitmq_server erlang rabbitmq-server
CMD tail -f /dev/null 