This directory contains some monitoring-related scripts. They are not general-purpose
tools, they are just some scripts we wrote for our own use. The package
update scripts are written for NixOS / RPM distros, and the service monitor only
knows how to talk `systemd`. All of these scripts assume you're using datadog
to report events.

Even if you don't use exactly these tools, these scripts might be a useful starting
point for your own monitoring scripts.
