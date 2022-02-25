########################################################
## estrazione pioggia trioraria moloch
## 
## UP, 2012
## adattamento moloch15: EP, 2019
########################################################
function main(args)
'reinit'
rc = gsfallow("on")
'q config'


*** lettura parametri riga comando
say ''
say 'GRADS: ---- ARGOMENTI PASSATI a estrazione_tp3_pc.gs: 'args' -------'
say ''

dataplot = subwrd(args,1)
run = subwrd(args,2)
say 'data e run: 'dataplot' 'run
say 'directory archivio grib: '
'printenv $tmp_dir'
dir_archivio = sublin(result,1)
say 'directory estrazioni: '
'printenv $txt_dir'
dir_dati = sublin(result,1)
say 'directory immagini: '
'printenv $png_dir'
dir_immagini = sublin(result,1)
say 'directory grafica: '
'printenv $graf_dir'
dir_graf = sublin(result,1)
say 'directory cartografia: '
'printenv $car_dir'
dir_car = sublin(result,1)
say 'directory griglie: '
'printenv $conf_dir'
dir_conf = sublin(result,1)

*** apertura dati
'open 'dir_archivio'/tp3_mol02.ctl'

*** impostazioni generali
'clear'
'set undef -99.9'
'run 'dir_graf'/colors_tp.gs'

*** dimensioni file
'set t 1'
'q file'
dimension = sublin(result,5)
x_siz = subwrd(dimension,3)
y_siz = subwrd(dimension,6)
t_siz = subwrd(dimension,12) ; say 'numero istanti temporali: ' t_siz


* imposto area di ritaglio lombardia
'set lat 44.6 46.8'
'set lon 8.4 11.6'

'q dims'
a = sublin(result,1)
b = sublin(result,2)
c = sublin(result,3)
d = sublin(result,4)

x_from = subwrd(b,11);xi_from= math_int(x_from)
x_to = subwrd(b,13); xi_to= math_int(x_to)
say 'x varia tra 'xi_from' a 'xi_to

y_from = subwrd(c,11);yi_from= math_int(y_from)
y_to = subwrd(c,13);yi_to= math_int(y_to)
say 'y varia tra 'yi_from' a 'yi_to

number_x = xi_to - xi_from +1 ; say 'numero di punti in x: 'number_x
number_y = yi_to - yi_from +1 ; say 'numero di punti in y: 'number_y

* reimposto area con x ed y per arrotondamento
'set x 'xi_from' 'xi_to
'set y 'yi_from' 'yi_to

*** impostazione parametri per ciclo
*t=scadenza di inizio; moloch dati triorari
t=2

*** ciclo
while (t<=t_siz)
 'set t 't
 say 't= 't
 'q time'

 data_fore=subwrd(result,3)
 year_fore=substr(data_fore,9,4)
 mon_fore=substr(data_fore,6,3)
 day_fore=substr(data_fore,4,2)
 hour_fore=substr(data_fore,1,2)
 monn_fore = month2number(mon_fore)

 say 'data completa: 'data_fore' 'year_fore' 'monn_fore' 'day_fore' 'hour_fore

 file_out = dir_dati'/moloch_estra_tp3_'dataplot run'_'year_fore monn_fore day_fore'-'hour_fore'.dat'
 say 'nome file output: 'file_out

*** definisco variabile tp3 (moloch ha pioggia cumulata)
 'define tp3h=(tp3*1)'

*** stampa tp3
 'run print_data.gs tp3h 'file_out' %.1f 'number_x

*** plot tp3 ****************************************************************
*** impostazione pagina
 'set grads off'
 'set gxout shade2b'
*** impostazione livelli
 'set clevs 0.1 0.5 1 3 5 7 10 15 20 30 40 50 60 70 80 100 120 150'
 'set ccols 0 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38'

*** plot
 'd tp3h'
 'run 'dir_graf'/cbarn.gs 0.9 1'
*** titolo
 'set string 3 l 6 0'
 'set strsiz 0.15'
 'draw string 2.0 8.3 MOLOCH_1.5'
 'set string 1 l 6 0'
 'draw string 3.6 8.3 'dataplot' 'run' forecast for: 'data_fore' [+'hour_fore']'
* shapefiles
    'run 'dir_graf'/province.gs'
    'run 'dir_graf'/nazioni1.gs'
    'run 'dir_graf'/fiumi_laghi.gs'
 'enable print 'dir_immagini'/moloch_tp3.'t'.gx'
 'print'
 'disable print'
 '!$GXYAT 'dir_immagini'/moloch_tp3.'t'.gx'
 '!rm -v 'dir_immagini'/moloch_tp3.'t'.gx'
 'clear'

****** fine plot tp3 *****************************************************
 t=t+1
endwhile

say 'GRADS: ---- estrazione_tp3_pc.gs: ESECUZIONE TERMINATA CON SUCCESSO -----'

'quit'
