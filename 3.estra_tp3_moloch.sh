#!/bin/bash
###	estra_tp3_moloch.sh
###	script shell per l'estrazione dati con OPENGRADS su MOLOCH
###	UP, giugno 2010
### adattamento moloch15: EP, marzo 2019

###	Parametri di script
nomescript=`basename $0 .sh`
fieldset=`basename $0 .sh |cut -d'_' -f3`
dataplot=$1
run=$2
datascad=$(date --date "$dataplot" +"$run"'Z'%d%b%Y)

echo
echo "----- INIZIO estrazione dati con $nomescript alle ore `date`---------"
echo
echo " ** data in esame (GRADS)------------> $dataplot ($datascad), run: $run"
echo

###	estrazione dati con CDO e GRADS
echo " ** estrazione dati con script GRADS ** "

# estraggo il campo delle precipitazioni (shortName unknown, levelType 1 per la tp3)
$grib_copy -w parameterNumber=8,shortName=unknown,levelType=1 $grib_dir/molita15_$dataplot$run.grib2 $tmp_dir/tp3_mol15.grib2

# remappo sulla griglia vecchia
$cdo remapbil,$conf_dir/moloch_02.grid $tmp_dir/tp3_mol15.grib2 $tmp_dir/tp3_mol02.grib2
rm -f $tmp_dir/tp3_mol15.grib2

# creo il file di controllo
echo "dset  $tmp_dir/tp3_mol02.grib2" > $tmp_dir/tp3_mol02.ctl
echo "index $tmp_dir/tp3_mol02.idx" >> $tmp_dir/tp3_mol02.ctl
awk '{if ((NR>=3) && (NR<=10)) print $0}' $conf_dir/mol02ar.ctl >> $tmp_dir/tp3_mol02.ctl
awk '{if (NR==11) print $0}' $grib_dir/molita15_$dataplot$run.ctl >> $tmp_dir/tp3_mol02.ctl
echo "vars 1" >> $tmp_dir/tp3_mol02.ctl
awk '{if (NR==28) print $0}' $conf_dir/molita15ar.ctl >> $tmp_dir/tp3_mol02.ctl
awk '{if (NR>=39) print $0}' $conf_dir/molita15ar.ctl >> $tmp_dir/tp3_mol02.ctl

# creo il file indice
gribmap -i $tmp_dir/tp3_mol02.ctl

# lancio lo script grads
$GRADS -blc "estrazione_tp3_pc.gs $dataplot $run"
if [ $? -ne 0 ]
then
	echo "errore estrazione_tp3_pc.gs"
	exit 1
fi

###	smistamento dati estratti
[...]

echo "----- FINE elaborazione dati con $nomescript alle ore `date`-------"
echo

exit
