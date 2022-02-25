#!/bin/bash
###	plot_moloch.sh <data> (formato AAAAMMGG) <run(hh)>

### leggo variabili locali
. $HOME/plot_moloch/conf/variabili_ambiente

### check date and help message
usage="Utilizzo: `basename $0` <data>(AAAAMMGG)> <run(HH)>"
usage1="Se non si specifica la data, viene usata quella odierna, se non si specifica il run viene usato quello delle 00"
dataoggi=$(date +%Y%m%d)

### parsing degli argomenti
if [ "$1" == "-h" ] || [ "$1" == "--help" ]
then
	echo $usage
	echo $usage1
	exit
fi

if [ $# -lt 2 ]
then
	echo "`basename $0`: numero insufficiente di argomenti."
	echo $usage
	exit
fi

if [ ! $1 ]
then
	dataplot=$dataoggi
else
	dataplot=$1
fi

if [ ! $2 ]
then
        run="00"
else
        run=$2
fi

###	definizioni
nomescript=`basename $0 .sh`
fieldset=`basename $0 .sh |cut -d'_' -f2` && echo "fieldset: $fieldset"
echo "data GRIB -----------> $dataplot"
echo "run -----------> $run"

control_plot=$log_dir/control_plot_$fieldset.$dataplot"_"$run".ctrl" && echo $control_plot

orainizio=$(date +%s)


### estrazione campo precipitazione tp3 per PC
echo
echo "estrazione campo pioggia triorario in formato matrice"
$bin_dir/estra_tp3_$fieldset.sh $dataplot $run
out_matrici=$?

if [ $out_matrici -eq 0 ]
then
	logger -is -p user.notice "$nomescript: estrazione matrici per PC terminata con successo" -t "PREVISORE"
else
	logger -is -p user.error "$nomescript: codice uscita estrazioni matrici PC = $out_matrici" -t "PREVISORE"
fi
echo
echo "fine estrazione campo pioggia triorario"
echo "--------------------------------------------------"

###	sezione plottaggio
[...]

