#!/bin/bash
## plot_moloch.sh <data (aaaammgg)> <run> (00, 06, 12, 18)

### leggo variabili locali
. $HOME/plot_moloch/conf/variabili_ambiente

### check date and help message
usage="Utilizzo: `basename $0` <data(aaaammgg)> <RUN (00/06/1/182)>"
usage1="Se non si specifica la data, viene usata quella odierna"

dataoggi=$(date +%Y%m%d)
dataieri=$(date --d yesterday +%Y%m%d)

### parsing degli argomenti
if [ "$1" == "-h" ] || [ "$1" == "--help" ]
then
	echo $usage
	echo $usage1
	exit
fi

if [ ! $1 ]
then
	export dataplot=$dataoggi
else
	export dataplot=$1
fi

if [ ! $2 ]
then
	echo "manca il run"
	echo $usage
	echo $usage1
	exit
else
	export run=$2
fi

### variabili 
nomescript=`basename $0 .sh`
export fieldset=`basename $0 .sh |cut -d'_' -f2`
export control=$log_dir/control_$nomescript"_"$run.$dataplot".ctrl"
export control_plot=$log_dir/control_plot_$fieldset.$dataplot"_"$run".ctrl"
day=`echo $dataplot |awk '{print substr($0,7,2)}'`
month=`echo $dataplot |awk '{print substr($0,5,2)}'`
year=`echo $dataplot |awk '{print substr($0,1,4)}'`
stringalog=$day" "$month" "$year

echo
echo "** inizio script `basename $0`: `date` ************************************"
echo "Data e corsa in esame---> $dataplot $run"
echo "Nome file controllo --------------> $control"

###	trap processi, 20130430
LOCKDIR=$tmp_dir/$nomescript-$dataplot-$run.lock && echo "lockdir -----> $LOCKDIR"
T_MAX=3600

if mkdir "$LOCKDIR" 2>/dev/null
then
	echo "acquisito lockdir: $LOCKDIR"
	echo $$ > $LOCKDIR/PID
else
	echo "Script \"$nomescript.sh\" già  in esecuzione alle ore `date +%H%M` con PID: $(<$LOCKDIR/PID)"
	echo "controllo durata esecuzione script"
	ps --no-heading -o etime,pid,lstart -p $(<$LOCKDIR/PID)|while read PROC_TIME PROC_PID PROC_LSTART
	do
		SECONDS=$[$(date +%s) - $(date -d"$PROC_LSTART" +%s)]
		echo "------Script \"$nomescript.sh\" con PID $(<$LOCKDIR/PID) in esecuzione da $SECONDS secondi"
		if [ $SECONDS -gt $T_MAX ]
		then
			echo "$PROC_PID in esecuzione da piÃ¹ di $T_MAX secondi, lo killo"
			pkill -15 -g $PROC_PID
		fi
	done
	echo "*********************************************************"
	exit
fi

trap "rm -fvr "$LOCKDIR";
rm -fv $tmp_dir/$$"_"*;
echo; 
echo \"** fine script `basename $0`: `date` ***************************************\";
exit" EXIT HUP INT QUIT TERM

### controllo che i dati siano gia'  stati scaricati (in questo caso passo al plot)
if [ -s $control ]
then
	echo
	echo "Dati $fieldset data $dataplot corsa $run gia' scaricati."
	if [ ! -s $control_plot ]
	then
		echo "----Lancio script 'plot_$fieldset.sh' per plottaggio mappe modello $fieldset data $dataplot corsa $run"
		$bin_dir/plot_$fieldset.sh $dataplot $run
	else
		echo "Plot $fieldset data $dataplot corsa $run gia' effettuato."
	fi
	exit
fi

### check and plot per moloch1.5
cd $tmp_dir

ncftpls $utenza -l $node1/moloch/molita15_*$dataplot$run.* > $$_$fieldset"_list" && cat $$_$fieldset"_list"
ncftpls_COD=$? && echo "codice uscita ncftpls= $ncftpls_COD"

if [ "$ncftpls_COD" -ne "0" ] 
then
	echo "codice uscita ncftpls diverso da 0"
		logger -is -p user.error "$nomescript: codice uscita ncftp = $ncftpls_COD" -t "PREVISORE"
	echo
	exit
fi	

if [ "`cat $$_$fieldset"_list" | wc -l `" -eq "3" ] #gpm 20190225: al posto del "2" c'era un "3"
then
	echo "I files esistono"
	echo "controllo che la dimensione del file grib non vari nel tempo"
	ncftpls $utenza -l $node1/moloch/molita15_$dataplot$run.grib2 > $$_$fieldset"_0"

    if [ ! -s $$_$fieldset"_0" ]
	then
		echo "il file $$_$fieldset"_0" e' vuoto: esco"
		exit
	fi

	dim0=`cat $$_$fieldset"_0"|awk '{print $3}'`
	echo "dimensione 0 del file = $dim0"
	sleep 60
	
	ncftpls $utenza -l $node1/moloch/molita15_$dataplot$run.grib2 >$$_$fieldset"_1"
	dim1=`cat $$_$fieldset"_1"|awk '{print $3}'`
	echo "dimensione 1 del file = $dim1"
	if [ "$dim0" -ne "$dim1" ]
	then
		echo "file in fase di scrittura...riprovare piu' tardi"
		exit
	fi
	if [[ "$dim1" -lt "555550" ]]
	then
		echo "dimensione del file grib2 piu' piccola del previsto; ESCO ED ASPETTO IL PROSSIMO GIRO"
		exit
	fi

	ncftpget -r 0 -V -DD $node $grib_dir $p/molita15_*$dataplot$run*
  
	echo "Acquisito grib $fieldset $dataplot $run ore: `date`"
	echo "OK $fieldset $dataplot $run" > $control

	# Mantengo "pulite" le directory /archivio/grib e /log cancellando i file piu' vecchi di 10 o 15 giorni
	find $grib_dir/ -type f -name "*.grib2" -mtime +10 -exec rm -v {} \;
	find $grib_dir/ -type f -name "*.idx" -mtime +10 -exec rm -v {} \;
	find $grib_dir/ -type f -name "*.ctl" -mtime +10 -exec rm -v {} \;
	find $log_dir/ -type f -name "*.log" -mtime +15 -exec rm -v {} \;
	find $log_dir/ -type f -name "*.ctrl" -mtime +15 -exec rm -v {} \;
	find $txt_dir/ -type f -name "*.dat" -mtime +15 -exec rm -v {} \;

        logger -is -p user.notice "$nomescript: acquisito grib $fieldset $dataplot $run" -t "PREVISORE"
	
	if [ ! -s $control_plot ]
	then 
		echo "----Lancio script 'plot_$fieldset.sh' per plottaggio mappe modello $fieldset data $dataplot corsa $run" 
		$bin_dir/plot_$fieldset.sh $dataplot $run
		ncftpget -r 0 -V -DD $node $grib_dir $p/molita15sfc_*$dataplot$run*
	else
		echo "Plot $fieldset data $dataplot corsa $run gia' effettuato."
		exit 0
	fi
else
	echo "I files non esistono ancora...riprovare piu' tardi"
#        logger -is -p user.warning "$nomescript: i files non esistono ancora...riprovo dopo" -t "PREVISORE"
fi

exit
