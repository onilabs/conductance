from mattdm/fedora:f20

# make sure the package repository is up to date
add resources/fedora.repo /etc/yum.repos.d/fedora.repo
add resources/fedora-updates.repo /etc/yum.repos.d/fedora-updates.repo

run yum -y update && yum clean all

run useradd app -M --shell /sbin/nologin
