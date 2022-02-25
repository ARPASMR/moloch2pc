# Versione 1.0 - Settembre 2021
FROM debian:11-slim

LABEL name="plottaggi Moloch"
LABEL version="1.0"
LABEL maintainer="EP"

# filesystem
RUN mkdir -p /opt/moloch/tmp/png
RUN mkdir -p /opt/moloch/web
RUN mkdir /opt/moloch/archivio
RUN mkdir /opt/moloch/bin
RUN mkdir /opt/moloch/cartog
RUN mkdir /opt/moloch/conf
RUN mkdir /opt/moloch/doc
RUN mkdir /opt/moloch/draw
RUN mkdir /opt/moloch/log
RUN mkdir /opt/moloch/src

# do i permessi a tutti
RUN chmod -R 777 /opt/moloch

# modalita' non interattiva
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

# cambio i timeout
RUN echo 'Acquire::http::Timeout "240";' >> /etc/apt/apt.conf.d/180Timeout

# installo gli aggiornamenti ed i pacchetti necessari (courtesy of https://github.com/occ-data/containers/blob/master/grads/Dockerfile et al.)
# tolti libc-dev zlib1g g++ udunits-bin
RUN apt-get update
RUN apt-get -y install curl git locales dnsutils openssh-client smbclient procps util-linux build-essential ncftp rsync libtool gcc gfortran
RUN apt-get -y install nfs-common openssl xorg xorg-dev libqt5core5a libqt5gui5 libjpeg-dev libpng-dev libbz2-dev python
RUN apt-get -y install libreadline-dev libeccodes0 libeccodes-tools grads

# compilo hdf5
COPY ./src/hdf5-1.12.1.tar.gz /opt/moloch/src/
ENV CPPFLAGS="$CPPFLAGS -fcommon"
RUN mkdir -p /opt/moloch/src/build \
	&& cd /opt/moloch/src \
	&& tar xvfz hdf5-1.12.1.tar.gz \
	&& cd /opt/moloch/src/build \
	&& ../hdf5-1.12.1/configure --prefix=/usr/local/hdf5 --enable-fortran --enable-cxx --with-default-api-version=v110 \
	&& make \
#	&& make check \
	&& make install \
	&& cd /opt/moloch \
	&& rm -rf src/*

# compilo netcdf
COPY ./src/netcdf-c-4.8.1.tar.gz /opt/moloch/src/ 
ENV CPPFLAGS="$CPPFLAGS -fcommon -I/usr/local/hdf5/include"
ENV LDFLAGS="-L/usr/local/hdf5/lib"
ENV LD_LIBRARY_PATH=/usr/local/hdf5/lib:$LD_LIBRARY_PATH
RUN cd /opt/moloch/src \
        && tar xvfz netcdf-c-4.8.1.tar.gz \
        && cd netcdf-c-4.8.1 \
        && ./configure --prefix=/usr/local/netcdf \
        && make \
#       && make check \
        && make install \
        && cd /opt/moloch \
        && rm -rf src/*

# finisco di installare i pacchetti
ENV PATH=$PATH:/usr/local/hdf5:/usr/local/netcdf
RUN apt-get -y install libnetcdf18 libnetcdf-dev jq libreadline-dev imagemagick libeccodes0 libeccodes-tools grads r-base r-base-dev

# compilo cdo-1.7.2 [versione vecchia, ma compatibile con il formato del file di griglia I7 per PC]
ENV CPPFLAGS="$CPPFLAGS -fcommon"
COPY ./src/cdo-1.7.2.tar.gz /opt/moloch/src/
RUN cd /opt/moloch/src \
	&& tar -xzvf cdo-1.7.2.tar.gz \
	&& cd cdo-1.7.2 \
	&& ./configure --with-netcdf=/usr/local/netcdf --with-hdf5=/usr/local/hdf5 \
	&& make \
	&& make install \
	&& cd /opt/moloch \
	&& rm -rf src

# compilo wgrib (va rivista questa parte decisamente obsoleta)
RUN mkdir -p /opt/moloch/src/wgrib
COPY ./src/wgrib_m.tar /opt/moloch/src/wgrib
RUN cd /opt/moloch/src/wgrib \
	&& tar xvf wgrib_m.tar \
	&& make \
	&& mv wgrib /usr/local/bin/ \
	&& cd /opt/moloch && rm -rf src/wgrib

# aggiungo ll
RUN echo "# .bash_aliases" >> /root/.bash_aliases \
        && echo "" >> /root/.bash_aliases && echo "alias ll='ls -alh'" >> /root/.bash_aliases \
        && echo "" >> /root/.bashrc \
        && echo "if [ -f ~/.bash_aliases ]; then . ~/.bash_aliases; fi" >> /root/.bashrc

# definisco l'entrypoint
ENTRYPOINT ["/bin/bash","/opt/moloch/entry.sh" ]

# atterro nella directory radice del processo
WORKDIR /opt/moloch

