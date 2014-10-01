from busybox:buildroot-2014.02
run /usr/sbin/adduser -H -D -s /bin/false app
# disable all setuid functionality
run find / -perm -4000 -exec chmod a-s {} \;
