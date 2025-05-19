/*
Название: MakeCropMarks.jsx
Приложение для использования: Adobe InDesign CS3, CS4, CS5, CS6
Версия: 1.7.9
Язык реализации (Среда): JavaScript (ExtendScript Toolkit 2)
Операционные системы (Платформы): PC, Macintosh (Windows, Mac OS)
Условия распространения: Бесплатно; На Ваш риск
Назначение: Создание меток реза
Функциональные ограничения: Не работает с выделенными направляющими
Примечание: Создается дополнительный файл MakeCropMarks.ini для хранения настроек
в папке со скриптом
Техническая поддержка: Sergey-Anosov@yandex.ru
https://sites.google.com/site/dtpscripting
===================================================
Name: MakeCropMarks.jsx
Application to use with: Adobe InDesign CS3, CS4, CS5, CS6
Version: 1.7.9
Program language (Environment): JavaScript (ExtendScript Toolkit 2)
Operating systems (Platforms): PC, Macintosh (Windows, Mac OS)
Distribution conditions: Freeware; At your own risk
Functions: Creates crop marks 
Functional limitations: Can not process containing guides selection
Note: Creates an additional file MakeCropMarks.ini for setup data
in the folder where the script is
Technical support: Sergey-Anosov@yandex.ru
https://sites.google.com/site/dtpscripting
*/
// описание глобальных переменных
//
// название скрипта
var the_title = "MakeCropMarks";
// версия скрипта
var the_version = "1.7.9";
// активный документ
var AD; 
// активный слой
var AL; 
// выбранный слой
var SL; 
// количество слоев в активном документе
var AD_LL;
// дропдаун выбора слоя
var LAYER_DROP;
// активная страница
var AP; 
// активный разворот
var AS;
// число страниц на активном развороте
var AS_NP;
// выделение в активном документе
var the_sel; 
// количество объектов в выделении
var N_sel = 0; 
// массив габаритов всего выделения
var SEL_SIZE;
// массив границ каждого объекта
var OBJ_SIZE;
// количество направлений (0=верх, 1=лево, 2=низ, 3=право)
var N_dir = 4;
// количество индексов для выбора границ (0=геометрические, 1= визуальные)
var N_b = 2;
// размерность массива для получения геометрических и визуальных размеров объекта (8)
var N_dir_b = N_dir * N_b;
// начальные настройки линеек в документе
var AD_ini_ruler_origin;
// начальные настройки единиц для обводки в документе
var AD_ini_str_units;
// настройки координат = разворот
var RULERS_SPREAD = false;
// объекты для построения меток
var OBJECTS_TO_MAKE = "";
// дропдаун выбора границ объектов
var BOUNDS_DROP;
// начальное значение для границ объектов
var BOUNDS_INI;
// массив текстовых значений опций для границ объектов
var BOUNDS_LIST = 
[
	// опция для геометрических размеров
	"Geometric",
	// опция для визуальных размеров
	// (с учетом толщины обводки)
	"Visible (consider objects stroke)"
];
// выбранные объекты имеют границы
var OBJ_HAVE_BOUNDS = false;
// массив построенных меток
var ALL_MARKS = new Array();
// массив координат построенных меток
var ALL_MARKS_BOUNDS = new Array();
// количество чекбоксов для направлений в диалоге
var N_dir_dial = 12;
// массив чекбоксов для выбора направлений для построения меток в диалоге
var DIR = new Array();
// массив значений чекбоксов для выбора направлений для построения меток в диалоге
var DIR_INI = new Array( N_dir_dial );
// текстовое значение для горизонтальных единиц измерения
var H_UNITS_TEXT = "";
// текстовое значение для вертикальных единиц измерения
var V_UNITS_TEXT = "";
// массив значений единиц измерений
var UN_LIST =
[
	[ 2054188905, "pt" ],// 0 points
	[ 2054187363, "pc" ],// 1 picas
	[ 2053729891, "in" ],// 2 inches
	[ 2053729892, "ind" ],// 3 inches decimal
	[ 2053991795, "mm" ],// 4 millimeters
	[ 2053336435, "cm" ],// 5 centimeters
	[ 2053335395, "ci" ],// 6 ciceros
	[ 2051106676, "ag" ],// 7 agates
	[ 2054187384, "px" ],// 8 pixels
	[ 1131639917, "cu." ]// 9 custom
];
// чекбокс для белого контура
var W_CONT_CB;
// начальное значение для белого контура
var W_CONT_INI;
// поле ввода и текст единиц измерения ширины для белого контура
var W_CONT_W = new Array( 2 );
// начальное значение ширины для белого контура
var W_CONT_W_INI;
// текст для белого контура
var W_CONT_TEXT = "White contour";
// дропдаун группировки меток после их создания
var G_M_DROP;
// начальное значение группировки после построения
var G_M_INI;// числовое значение
// начальный список для дропдауна для группировки меток
var G_M_LIST = 
[ 
	"Nothing", // опция "нет группировки"
	"Marks only" // опция "только метки"
];
// если была автоматическая корректировка опции 
// для группировки меток и выделения после смены объектов 
// с выделения на страницы или разворот и обратно
var G_AUTO = false;
// длина меток по вертикали
var LENGTH_VER;
// начальное значение для длины меток по вертикали
var LENGTH_VER_INI;
// длина меток по горизонтали
var LENGTH_HOR;
// начальное значение для длины меток по горизонтали
var LENGTH_HOR_INI;
// отступ меток по вертикали
var OFFSET_VER;
// начальное значение для отступа меток по вертикали
var OFFSET_VER_INI;
// отступ меток по горизонтали
var OFFSET_HOR;
// начальное значение для отступа меток по горизонтали
var OFFSET_HOR_INI;
// вылеты объектов по вертикали
var BLEED_VER;
// начальное значение для вылетов объектов по вертикали
var BLEED_VER_INI;
// вылеты объектов по горизонтали
var BLEED_HOR;
// начальное значение для вылетов объектов по горизонтали
var BLEED_HOR_INI;
// поле ввода для толщины метки
var str_w_ed_text;
// значение для толщины метки
var SW_NUM;
// начальное значение для толщины метки
var SW_NUM_INI;
// текст для толщины линии
var SW_TEXT = "Stroke weight";
// дропдаун единиц измерения для толщины метки
var str_un_drop;
// массив значений единиц измерений для толщины линий
var UN_STR_LIST =
[
	UN_LIST[4][1], // 0 mm
	UN_LIST[5][1], // 1 cm
	UN_LIST[0][1], // 2 pt
	UN_LIST[2][1] // 3 in
];
// начальное значение для единиц измерения для толщины метки (пункты)
var SW_UN_INI;
// версия приложения InDesign
// 3=CS; 4=CS2; 5=CS3; 6=CS4; 7=CS5; 8 = CS6; 9 = CC
var APP_VERSION = parseInt( app.version );
// версия приложения InDesign СС
var CC = ( APP_VERSION >= 9 );
// файловая система Windows
var WFS = ( File.fs == "Windows" );
// версия CS3 для Windows
var CS3_WIN = ( ( APP_VERSION == 5 ) && WFS );
// мастер-объект для горизонтальных меток
var MASTER_HOR = [ false, undefined ];
// мастер-объект для вертикальных меток
var MASTER_VER = [ false, undefined ];
// дропдаун для выбора объектов для построения меток
var OBJ_DROP;
// опция для 1 объекта в выделении
var SEL_OBJ_OPTION = "Selected object";
// опция для каждого объекта в выделении
var EACH_OBJ_OPTION = "Each object in selection"; 
// опция для целого выделения
var ENTIRE_SEL_OPTION = "Entire selection";
// опция для активной страницы
var AP_OPTION = "Active page";
// опция для активного разворота
var AS_OPTION = "Active spread"; 
// опция для каждой страницы на развороте
var EACH_PAGE_OPTION = "Each page on active spread";
// результат ввода в диалоге
var exit_if_bad_input = false;
// выход если непригодное выделение
var exit_if_bad_sel = false;
// текст сообщения для ошибки ввода
var BAD_VAL_TEXT = "Bad value input!\n\n";
// текст условия для ошибки ввода
var CAN_NOT_BE = " can not be <= 0 !";
// чекбокс запомнить направления
var REM_DIR_CB;
// значение чекбокса запомнить направления
var REM_DIR = true;
// чекбокс для учета наложения объектов
var CONS_OVER_CB;
// учет наложения объектов
var CONS_OVER = true;
// номер текущего обрабатываемого объекта
var OBJ_i = 0;
// дропдаун для выбора цвета меток
var COLOR_DROP;
// выбранная опция цвета из диалога
var COLOR_VAL = 0;
// массив свотчей для диалога
var SWATCHES = new Array();
// цвет для меток
var M_COLOR;// метки
var WHITE;// контур
// точность сравнения координат (допуск)
// для объектов и меток при учете наложения объектов
var PREC_MARKS_OBJ = 0.001;
// точность сравнения координат (допуск)
// для сделанных меток и создаваемой метки
var PREC_MARKS = PREC_MARKS_OBJ * 5.;
// текстовое значение для нуля
var ZERO_TEXT = "0";
// кнопка ОК
var okBtn;
//
// вызов главной подпрограммы
main();
// окончание выполнения скрипта :)))
//
// блок описания подпрограмм
//
// главная подпрограмма
function main() 
{
	// вызываем проверку документа и выделения
	CHECK_SELECTION();
	// если в порядке выделение и документ:
	// устанавливаем начальные значения параметров для диалога
	INI_FILE_IO( false );
	//создаем диалог
	var dlg = new Window('dialog');
	// заголовок диалога
	dlg.text = the_title + " v." +the_version; 
	dlg.alignChildren = 'center';
	// ширина дропдаунов для выбора объектов, границ, слоя
	var DD_WIDTH = WM( CSCC( 85, 87 ), 90 );
	// количество дропдаунов
	var N_DD = 3;
	// в диалоге 3 дропдауна
	var N_DD_3 = true;
	// определяем количество дропдаунов Objects, Bounds, Layer
	// если только 1 слой в документе
	if( AD_LL == 1 ) 
	{
		// если нет выделения 1 дропдаун: Objects
		// если есть выделение 2 дропдауна: Objects, Bounds
		N_DD = ( N_sel == 0 ) ? 1 : 2;
	}
	else
	// если больше одного слоя в документе
	{
		// если нет выделения 2 дропдауна: Objects, Layer
		// если есть выделение 3 дропдауна: Objects, Bounds, Layer
		N_DD = ( N_sel == 0 ) ? 2 : 3;
	};// if-else	
	// если дропдаунов меньше трех
	if( N_DD < 3 )
	{
		// делаем их широкими
		DD_WIDTH = 90;
		// НЕ три дропдауна
		N_DD_3 = false;
	};// if
	// создание главной панели
	var mp = dlg.add('panel');
	// границы главной панели
	var mp_left = 5;// левая
	var mp_top = 5;// верхняя
	var mp_right = WM( CSCC( 430, 450 ), 470 );// правая
	var mp_bottom = WM( 226, 227 );// нижняя
	// присваиваем границы главной панели
	mp.bounds = [ mp_left, mp_top, mp_right, mp_bottom ];
	// размеры чекбокса
	var cb_w = 20;// ширина
	var cb_h = 15;// высота
	// шаг чекбоксов по горизонтали 
	var  cb_dx = 50;
	// шаг чекбоксов по вертикали 
	var  cb_dy = 50;
	// высота текста для подсказки
	var tip_h = 18;
	// шаг по вертикали для панелей
	var pan_dy = 27;
	//
	// подпрограмма создания группы в диалоге
	function MAKE_GROUP( where, g_orient, g_align )
	{
		// создаем группу в диалоге
		var g = where.add('group');
		// если задана ориентация группы
		if( g_orient !== false )
		{
			// присваиваем ориентацию
			// "column" = вертикальная
			// "row" = горизонтальная
			g.orientation = g_orient;
		};// if
		// если задано выравнивание в группе
		if( g_align !== false )
		{
			// присваиваем выравнивание
			g.alignChildren = g_align;
		};// if
		return g;
	};// end MAKE_GROUP
	//
	// подпрограмма создания текста в диалоге
	// type - тип создаваемого текста "static" или "edit"
	function MAKE_TEXT( type, where, txt, t_bounds )
	{
		// создаем текстовый объект заданного типа
		var t = where.add( type + "text" );
		// присваиваем текст
		t.text = txt;
		// если заданы границы
		if( t_bounds !== false )
		{
			// присваиваем границы
			t.bounds = t_bounds;
		};// if
		// если редактируемый текст
		if( type == "edit" )
		{
			// подпрограмма реакции на ввод текста (в процессе)
			t.onChanging = function()
			{
				digit_on_Changing( t, txt, ZERO_TEXT );
				return;
			};// end t.onChanging
			//
			// подпрограмма реакции на ввод текста (окончание)
			t.onChange = function()
			{
				t.text = CHECK_ZERO_TEXT( t.text );
				return;
			};// end t.onChange
			//
			// подпрограмма обработки поля ввода в процессе
			// et - поле ввода
			// def - значение по умолчанию если ошибка ввода
			// emp - значение если пустое поле
			function digit_on_Changing( et, def, emp ) 
			{
				// если была ошибка ввода
				if( exit_if_bad_input )
				{
					exit_if_bad_input = false;
					et.active = true;
					// если версия CS3 и операционная система Windows
					if( CS3_WIN )
					{
						// присваиваем текст по умолчанию
						et.text = def;
						// выход чтобы не было повторного вывода сообщения об ошибке
						return;
					};// if
				};// if
				// получаем из поля ввода текстовую строку для перевода в число
				var STR = STR_FOR_NUM( et.text );
				// если строка из поля ввода не пригодна для перевода в число
				if( STR === false )
				{
					// считаем, что ошибка ввода
					exit_if_bad_input = true;
					// выводим сообщение об ошибке ввода
					alert( "Bad number input!" );
					// присваиваем текст по умолчанию в поле ввода
					et.text = def;
					// активируем поле ввода
					et.active = true;
				};// if
				// если пустая строка в поле ввода
				if( STR === "" )
				{
					// присваиваем текст если пустое поле
					et.text = emp;
				};// if
				return;
			};// end digit_on_Changing
			//
		};// if
		return t;
	};// end MAKE_TEXT
	//
	// подпрограмма создания дропдауна
	function MAKE_DROP( where, txt, txt_w, x, y, w, arr, ini )
	{
		// высота дропдауна
		var dd_h = 20;
		// начальное значение объекта для создания дропдауна и текста
		var dd_where = where;
		// начальное значение правой границы текста если НЕ задано создание текста
		var t_right = x;
		// если задано создание текстовой подсказки
		if( txt !== false )
		{
			// если задана ширина текста
			if( txt_w !== false )
			{
				// границы текста
				var t_left = x;// левая граница
				var t_top = y + 3;// верхняя граница
				t_right = t_left + txt_w + 3;// правая граница
				var t_bottom = y + dd_h;// нижняя граница
				// присваиваем границы текста
				var t_bounds = [ t_left, t_top, t_right, t_bottom ];
			}
			// если НЕ задана ширина текста
			else
			{
				// создаем группу для текста и дропдауна
				dd_where = MAKE_GROUP( where, 'row', 'center' );
				// границы текста не создаются
				var t_bounds = false;
			};// if-else
			// создаем статический текст
			MAKE_TEXT( "static", dd_where, txt, t_bounds );
		};// if
		// создаем дропдаун
		var d = dd_where.add('dropdownlist');
		// если задано положение дропдауна
		if( ( x !== false ) && ( y !== false ) )
		{
			// границы дропдауна
			var d_left = t_right;// левая граница
			var d_top = y;// верхняя граница
			var d_right = d_left + w;// правая граница
			var d_bottom = d_top + dd_h;// нижняя граница
			// присваиваем границы дропдауна
			d.bounds = [ d_left, d_top, d_right, d_bottom ];
		}
		// если НЕ задано положение дропдауна
		else
		{
			// присваиваем ширину дропдауна
			d.minimumSize.width = d.maximumSize.width = w;
			// присваиваем высоту дропдауна
			d.minimumSize.height = d.maximumSize.height = dd_h;
		};// if-else
		// заполняем варианты
		for( var i = 0; i < arr.length; i++ ) d.add( 'item', arr[ i ] );
		// присваиваем начальное значение
		d.selection = ini;
		return d;
	};// end MAKE_DROP
	//
	// подпрограмма активации / деактивации дропдауна
	// the_drop - дропдаун
	// активация: act = true, деактивация act = false;
	// ini - начальное выделение, выбранная опция после активации
	function DROP_ACTIVE( the_drop, act, ini ) 
	{
		try
		{
			// если дропдаун не создан выход
			if( the_drop === undefined ) return ini;
			// если дропдаун уже в заданном состоянии
			if( the_drop.enabled == act )
			{
				return ( act ? the_drop.selection.index : ini );
			};// if
			// если деактивация
			if( !act ) 
			{
				// СНАЧАЛА получаем индекс выделения дропдауна
				var the_index = the_drop.selection.index;
				// добавляем вариант N/A
				var NA = the_drop.add('item', "N/A");
				// ставим выделение в дропдауне на N/A 
				NA.selected = true;
			} 
			// если активация
			else 
			{
				// удаляем вариант N/A
				the_drop.remove( the_drop.items[the_drop.items.length-1] );
				// ставим выделение в дропдауне начальное значение
				the_drop.selection = ini;
				// ПОСЛЕ ЭТОГО получаем индекс выделения дропдауна
				var the_index = the_drop.selection.index;
			};// if-else
			// присваиваем заданное состояние дропдауна
			the_drop.enabled = act;
		} catch ( error ) {};// try-catch
		// возвращаем значение индекса выделения дропдауна
		// для использования в переменной для начального выделения
		return the_index;
	};// end DROP_ACTIVE
	// 
	// подпрограмма создания чекбокса
	function MAKE_CB( where, x, y, w, txt, ini )
	{
		// создаем чекбокс
		var cb = where.add('checkbox');
		// присваиваем границы чекбокса
		cb.bounds = [ x, y, x + w, y + cb_h ];
		// если задано создание текстовой подсказки
		if( txt !== false )
		{
			// присваиваем текст
			cb.text = txt;
		};// if
		// присваиваем начальное значение
		cb.value = ini;
		return cb;
	};// end MAKE_CB
	//
	// подпрограмма активации / деактивации чекбокса
	function CB_ACTIVE( cb, act )
	{
		// если чекбокс уже в заданном состоянии выход
		if( cb.enabled == act ) return;
		// присваиваем чекбоксу заданное состояние и значение
		cb.enabled = cb.value = act;
		return;
	};// end CB_ACTIVE
	//
	// подпрограмма реакции на нажатие чекбокса
	function DIR_CB_onClick()
	{
		// если кнопка OK в диалоге не определена сразу выход
		if( okBtn === undefined ) return;
		// нажат ли хотя бы один чекбокс для направления
		var the_dir_stat = DIR_STATUS( DIR, undefined, false );
		// изменяем активность кнопки OK
		if( okBtn.enabled != the_dir_stat ) okBtn.enabled = the_dir_stat;
		return;
	};// end DIR_CB_onClick
	//
	// подпрограмма управления и контроля состояний чекбоксов
	// the_arr - массив чекбоксов или значений для чекбоксов
	// act - значение
	// set: true - установить значение, false - получить значение 
	function DIR_STATUS( the_arr, act, set )
	{
		// входящий массив - чекбоксы
		var arr_cb = the_arr[0].hasOwnProperty( "value" );
		// цикл по входному массиву
		for( var i = 0; i < the_arr.length; i++ )
		{
			// если присваиваем значение
			if( set ) 
			{
				// чекбоксам или переменным
				if( arr_cb ) 
				{
					the_arr[i].value = act;
				}
				else
				{
					the_arr[i] = act;
				};// if-else
			}
			// если получаем значение 
			else
			{
				// и хотя бы один чекбокс нажат
				// сразу возвращаем истина
				if( the_arr[i].value ) return true;
			};// if-else
		};// for
		return false;
	};// end DIR_STATUS
	//
	// подпрограмма создания кнопки
	function MAKE_BUTTON( x, y, w, where, txt )
	{
		// создаем кнопку
		var b = where.add('button');
		// присваиваем текст
		b.text = txt;
		// если заданы координаты и ширина кнопки
		if( ( x !== false ) && ( y !== false ) && ( w !== false ) )
		{
			// высота кнопки
			var btn_h = 20;
			// присваиваем границы кнопки
			b.bounds = [ x, y, x + w, y + btn_h ];
		};// if
		return b;
	};// end MAKE_BUTTON
	//
	// подпрограмма создания линии в диалоге
	function MAKE_LINE_DIAL() 
	{
		var the_line = dlg.add('panel');
		the_line.bounds = [mp_left, undefined, mp_right, undefined];
		return;
	};// end MAKE_LINE_DIAL
	//
	// подпрограмма создания вертикальной или горизонтальной группы чекбоксов
	// hor: true - по горизонтали, false - по вертикали
	function H_V_CB_GROUP( hor, x, y, where )
	{
		// количество создаваемых чекбоксов
		var N_cb = 3;
		// массив чекбоксов
		var cb_arr = new Array( N_cb );
		// смещения чекбоксов по горизонтали
		var dx = ( hor ) ? ( [ WM( -3, 0 ), WM( -6, -5 ), WM( -10, -9 ) ] ) : ( [ 0, 0, 0 ] );
		// смещения чекбоксов по вертикали
		var dy = ( hor ) ? ( [ 0, 0, 0 ] )  : ( [ 0, WM( -3, -2 ), -5 ] );
		// положение чекбокса по горизонтали
		var x_cb = x;
		// положение чекбокса по вертикали
		var y_cb = y;
		// цикл по создаваемым чекбоксам
		for( var i = 0; i < N_cb; i++ )
		{
			// создаем чекбокс
			cb_arr[i] = MAKE_CB( where, x_cb + dx[i], y_cb + dy[i], WM( 15, cb_w ), false, false );
			// координаты для следующего чекбокса
			x_cb = x_cb + ( (hor) ? cb_dx : 0 );// по горизонтали
			y_cb = y_cb + ( (hor) ? 0 : cb_dy );// по вертикали
		};// for
		// возвращаем массив чекбоксов
		return cb_arr;
	};// end H_V_CB_GROUP
	//
	// подпрограмма создания блока выбора направлений
	function MAKE_DIRECTIONS( x, y )
	{
		// подпрограмма заполнения массива чекбоксов направлений
		function GET_DIR_CB( the_cb_arr )
		{
			// добавляем к массиву чекбоксов новые
			for( var i = 0; i < the_cb_arr.length; i++ )
			{
				DIR.push( the_cb_arr[i] );
			};// for
			return;				
		};// end GET_DIR_CB
		//
		//	индексы меток и чекбоксов
		//
		//		9	10	11
		//	0					3
		//	1					4
		//	2					5
		//		6	7	8
		//
		// вертикальный блок меток слева ( 0, 1, 2 )
		// положение вертикального блока меток слева ( 0, 1, 2 )
		var x_012 = x + 2 + WM( 4, 0 );// по горизонтали
		var y_012 = y + cb_h + 2;// по вертикали
		// получаем вертикальный блок меток слева ( 0, 1, 2 )
		GET_DIR_CB( H_V_CB_GROUP( false, x_012, y_012, mp ) );
		//
		// вертикальный блок меток справа ( 3, 4, 5 )
		// положение вертикального блока меток справа ( 3, 4, 5 )
		var x_345 = x + ( cb_w + cb_dx ) * 2 - 10 + WM( 1, 0 );// по горизонтали
		var y_345 = y_012;// по вертикали
		// получаем вертикальный блок меток справа ( 3, 4, 5 )
		GET_DIR_CB( H_V_CB_GROUP( false, x_345, y_345, mp ) );
		//
		// горизонтальный блок меток внизу ( 6, 7, 8 )
		// положение горизонтального блока меток внизу ( 6, 7, 8 )
		var x_678 = x + cb_w + WM( 5, 0 );// по горизонтали
		var y_678 = y + ( cb_h + cb_dy ) * 2 - WM( 1, 0 );// по вертикали
		// получаем горизонтальный блок меток внизу ( 6, 7, 8 )
		GET_DIR_CB( H_V_CB_GROUP( true,  x_678, y_678, mp ) );
		//
		// горизонтальный блок меток вверху ( 9, 10, 11 )
		// положение горизонтального блока меток вверху ( 9, 10, 11 )
		var x_9_10_11 = x_678;// по горизонтали
		var y_9_10_11 = y + WM( 0, -1 );// по вертикали
		// получаем горизонтальный блок меток вверху ( 9, 10, 11 )
		GET_DIR_CB( H_V_CB_GROUP( true, x_9_10_11, y_9_10_11, mp ) );
		//
		// присваиваем длину массива для чекбоксов направлений
		DIR.length = N_dir_dial;
		// присваиваем дополнительные значения для чекбоксов направлений 
		for( var i = 0; i < N_dir_dial; i++ )
		{
			// если было задано запоминать направления
			// присваиваем значение чекбокса (был нажат или нет :)))
			if( REM_DIR ) DIR[i].value = DIR_INI[i];
			// присваиваем подпрограмму реакции на нажатие
			DIR[i].onClick = DIR_CB_onClick;
		};// for
		// создаем прямоугольник
		var rect = mp.add('panel');
		// границы прямоугольника
		var rect_dx_dy = 2;// дополнительный сдвиг по вертикали и горизонтали
		var rect_left = x + cb_w + rect_dx_dy;// левая граница
		var rect_top = y + cb_h + rect_dx_dy;// верхняя граница
		var rect_right = x + ( cb_w - 7 + cb_dx ) * 2 - rect_dx_dy + 5;// правая граница
		var rect_bottom = y + ( cb_h + cb_dy ) * 2 - rect_dx_dy;// нижняя граница
		// присваиваем границы прямоугольника
		rect.bounds = [ rect_left, rect_top, rect_right, rect_bottom ];
		// границы кнопок внутри прямоугольника
		var b_w = 85;// ширина кнопок
		var b_left = 10 - WM( 2, 0 );// левая граница кнопок
		var b_dy = 33;// шаг для кнопок по вертикали
		// создаем кнопку снять все
		var b_uncheck_all_y = 10;
		var UNCH_TEXT = "Uncheck" + WM( " all", "" );
		var b_uncheck_all = MAKE_BUTTON( b_left, b_uncheck_all_y, b_w, rect, UNCH_TEXT );
		b_uncheck_all.onClick = UNCHECK_ALL_ON_CLICK;
		//
		// подпрограмма реакции на нажатие кнопки Uncheck all
		function UNCHECK_ALL_ON_CLICK()
		{
			// отключаем все чекбоксы
			DIR_STATUS( DIR, false, true );
			// отключаем активность кнопки OK
			okBtn.enabled = false;
			return;
		};// end UNCHECK_ALL_ON_CLICK
		//
		// создаем кнопку направления по умолчанию
		var b_dir_default_y = b_uncheck_all_y + b_dy;// верхняя граница
		var b_dir_default = MAKE_BUTTON( b_left, b_dir_default_y, b_w, rect, "Default" );
		b_dir_default.onClick = B_DIR_DEFAULT_ON_CLICK;
		//
		// подпрограмма реакции на нажатие кнопки Default
		function B_DIR_DEFAULT_ON_CLICK()
		{
			// сначала отключаем все чекбоксы
			DIR_STATUS( DIR, false, true );
			// включаем "крайние" чекбоксы
			DIR_STATUS( [ DIR[0], DIR[2], DIR[3], DIR[5], DIR[6], DIR[8], DIR[9], DIR[11] ], true, true );
			// включаем активность кнопки OK
			okBtn.enabled = true;
			return;
		};// end B_DIR_DEFAULT_ON_CLICK
		//
		// создаем кнопку выделить все
		var b_check_all_y = b_dir_default_y + b_dy;// верхняя граница
		var b_check_all = MAKE_BUTTON( b_left, b_check_all_y, b_w, rect, "Check all" );
		b_check_all.onClick = CHECK_ALL_ON_CLICK;
		//
		// подпрограмма реакции на нажатие кнопки Check all
		function CHECK_ALL_ON_CLICK()
		{
			// включаем все чекбоксы
			DIR_STATUS( DIR, true, true );
			// включаем активность кнопки OK
			okBtn.enabled = true;
			return;
		};// end CHECK_ALL_ON_CLICK
		//
		// положение для чекбоксов запомнить направления и учета наложения объектов
		var c_box_w = WM( 140, 170 );// ширина чекбоксов
		var c_box_x = x_012;// лево чекбоксов
		// чекбокс запомнить направления
		var REM_DIR_CB_y = y + WM( 156, 157 );
		var REM_DIR_CB_TEXT = "Remember directions";
		REM_DIR_CB = MAKE_CB( mp, c_box_x, REM_DIR_CB_y, c_box_w, REM_DIR_CB_TEXT, REM_DIR );
		// чекбокс учета наложения объектов
		var CONS_OVER_CB_y = REM_DIR_CB_y + pan_dy;
		var CONS_OVER_CB_TEXT = "Consider overlapping";
		CONS_OVER_CB = MAKE_CB( mp, c_box_x, CONS_OVER_CB_y, c_box_w, CONS_OVER_CB_TEXT, true );
		return;
	};// end MAKE_DIRECTIONS
	//
	// собственно создаем блок чекбоксов выбора направлений для меток
	MAKE_DIRECTIONS( mp_left + WM( CSCC( 1, 1 ), 3 ), mp_top + WM( CSCC( 4, 6 ), 4 ) );
	//
	// переменные для создания элементов ввода параметров в диалоге
	// высота поля ввода
	var h_pan = 22;
	// ширина текста для подсказки
	var w_txt_pan = WM( CSCC( 55, 59 ), 67 );
	// ширина поля ввода
	var w_et_pan = WM( CSCC( 50, 48 ), 50 );
	// дополнительный сдвиг вправо для единиц измерения и полей ввода
	var dx_un_pan = 3;
	// дополнительный сдвиг вниз для текста
	var dy_t_pan = WM( CSCC( 3, 0 ), 2 );
	// сдвиг по горизонтали
	// для панелей параметров по вертикали и горизонтали
	var pan_dx = WM( CSCC( 108, 106 ), 108 );
	// сдвиг вправо для поля ввода для значений по вертикали
	var et_v_dx = w_txt_pan + dx_un_pan;
	//
	// подпрограмма создания панели ввода параметров
	function MAKE_PANEL( x, y, where, vert_ini, hor_ini, txt )
	{
		// текст подсказки для названия параметра
		//  x = лево,  y + dy_t_pan = верх,  x + w_txt_pan = право,  y + dy_t_pan + tip_h = низ
		MAKE_TEXT( "static", where, txt, [ x , y + dy_t_pan, x + w_txt_pan, y + dy_t_pan + h_pan ] );
		// x для поля ввода для значений по вертикали
		x += et_v_dx;
		// создаем поле ввода для значений по вертикали 
		// [0] = только поле ввода без объекта текст единиц измерения
		var et_vert = ED_TEXT( where, x, y, vert_ini, V_UNITS_TEXT )[0];
		// x для поля ввода для значений по горизонтали
		x += pan_dx;
		// создаем поле ввода для значений по горизонтали
		// [0] = только поле ввода без объекта текст единиц измерения
		var et_hor = ED_TEXT( where, x, y, hor_ini, H_UNITS_TEXT )[0];
		// возвращаем поля ввода для вертикали и горизонтали
		return [ et_vert, et_hor ];
	};// end MAKE_PANEL
	//
	// подпрограмма создания окна ввода с единицами измерения
	function ED_TEXT( where, x_e, y_e, ini_txt, un_txt )
	{
		// границы поля ввода (редактируемый текст)
		var et_right = x_e + w_et_pan;// правая граница
		// x_e = лево, y_e = верх, et_right = право, y_e + h_pan = низ
		var et_bounds = [ x_e, y_e, et_right, y_e + h_pan ];
		// создаем поле ввода (редактируемый текст)
		var et = MAKE_TEXT( "edit", where, ini_txt, et_bounds );
		// границы текста для единиц измерения (статический текст)
		var un_left = et_right + dx_un_pan;// левая граница 
		var w_un = 30;// ширина
		// un_left = лево, y_e + dy_t_pan = верх, un_left + w_un = право, y_e + dy_t_pan + h_pan = низ
		var un_bounds = [ un_left, y_e + dy_t_pan, un_left + w_un, y_e + dy_t_pan + h_pan ];
		// создаем текст для единиц измерения (статический текст)
		var un = MAKE_TEXT( "static", where, un_txt, un_bounds );
		// возвращаем поле ввода и текст для единиц измерения
		return [ et, un ];
	};// end ED_TEXT
	//
	// подпрограмма создания панели для опций
	function MAKE_OPTIONS_PANEL( x, y )
	{
		// массив для получения значений из подпрограмм создания панелей ввода
		var VER_HOR_ARR = new Array( 2 );
		// строка 1
		// верхняя граница заголовков
		var y_title = y;
		// ширина текста для заголовков для вертикали и горизонтали
		var title_w = 70;
		// заголовок для вертикали
		var v_title_x = x + et_v_dx;// левая граница
		MAKE_TEXT( "static", mp, "Vertical", [ v_title_x, y_title, v_title_x + title_w, y_title + tip_h ] );
		// заголовок для горизонтали
		var h_title_x = v_title_x + pan_dx;// левая граница
		MAKE_TEXT( "static", mp, "Horizontal", [ h_title_x, y_title, h_title_x + title_w, y_title + tip_h ] );
		// строка 2
		// панель для длины
		var pan_y_length =  y + pan_dy - 7;
		VER_HOR_ARR = MAKE_PANEL( x, pan_y_length, mp, LENGTH_VER_INI, LENGTH_HOR_INI, "Length:" );
		// длина вертикальных меток
		LENGTH_VER = VER_HOR_ARR[0];
		// длина горизонтальных меток
		LENGTH_HOR = VER_HOR_ARR[1];
		// строка 3
		// панель для оффсета (отступа)
		var pan_y_offset = pan_y_length + pan_dy;
		VER_HOR_ARR = MAKE_PANEL( x, pan_y_offset, mp, OFFSET_VER_INI, OFFSET_HOR_INI, "Offset:" );
		// отступ по вертикали
		OFFSET_VER = VER_HOR_ARR[0];
		// отступ по горизонтали
		OFFSET_HOR = VER_HOR_ARR[1];
		// строка 4
		// панель для вылета
		var pan_y_bleed = pan_y_offset + pan_dy;
		VER_HOR_ARR = MAKE_PANEL( x, pan_y_bleed, mp, BLEED_VER_INI, BLEED_HOR_INI, "Bleed:" );
		// вылет по вертикали
		BLEED_VER = VER_HOR_ARR[0];
		// вылет по горизонтали
		BLEED_HOR = VER_HOR_ARR[1];
		// ширина текста для следующих дропдаунов:
		// толщина линии, группировка после, цвет меток
		var text_dd_w = WM( CSCC( 105, 107 ), 117 );
		// строка 5
		// панель для толщины линии
		var str_w_y = pan_y_bleed + pan_dy;
		// создаем текст подсказки для толщины линии
		MAKE_TEXT( "static", mp, SW_TEXT + ":", [ x, str_w_y + 3, x + text_dd_w, str_w_y + 3 + tip_h ] );
		// левая граница поля ввода для толщины линии
		var str_w_left = (x + text_dd_w) + 3;
		// ширина поля ввода толщины линии
		var str_w_ed_text_w = 55;
		// правая граница поля ввода для толщины линии
		var str_w_right = str_w_left + str_w_ed_text_w;
		// границы поля ввода для толщины линии
		var str_w_ed_text_bounds = [ str_w_left, str_w_y, str_w_right, str_w_y + h_pan ];
		// создаем поле ввода для толщины линии
		str_w_ed_text = MAKE_TEXT( "edit", mp, SW_NUM_INI, str_w_ed_text_bounds );
		// дропдаун единиц для толщины линии
		var str_un_drop_left = str_w_right + 3;// лево
		// ширина дропдауна единиц для толщины линии
		var un_dd_w = WM( CSCC( 67, 70 ), 70 );
		// создаем дропдаун единиц для толщины линии
		str_un_drop =  MAKE_DROP( mp, false, false, str_un_drop_left, str_w_y, un_dd_w, UN_STR_LIST, SW_UN_INI );
		//
		// подпрограмма реакции на изменение дропдауна 
		// для единиц толщины линии
		str_un_drop.onChange = function()
		{
			// присваиваем текстовое значение для единиц измерения
			// ширины белого контура
			W_CONT_W[ 1 ].text = UN_STR_LIST[ str_un_drop.selection.index ];
			return;
		};// end str_un_drop.onChange
		//
		// ширина дропдаунов для группировки и цвета
		var drop_w = WM( CSCC( 125, 128 ), 128 );
		// строка 6
		// группировка меток
		var g_m_y = str_w_y + pan_dy;
		// если есть выделение добавляем опцию группировать метки и выделение
		if( N_sel > 0 ) G_M_LIST.push( "Marks and selection" );
		// если начальная опция группировать метки и выделение
		// но в документе нет выделения
		if( (G_M_INI == 2) && (N_sel == 0) )
		{
			// начальную опцию ставим группировать только метки
			G_M_INI = 1;
			// автоматическая корректировка как бы была :)))
			G_AUTO = true;
		};// if
		// создаем дропдаун для группировки
		G_M_DROP = MAKE_DROP( mp, "Group after: ", text_dd_w, x, g_m_y, drop_w, G_M_LIST, G_M_INI );
		// строка 7
		// дропдаун выбора цвета
		var c_drop_y = g_m_y + pan_dy;
		// начальный вариант цвета для диалога (Registration)
		var M_C_INI = 0;
		// заполняем массив имен свотчей документа
		for( var i = 0; i < AD.swatches.length; i++ )
		{
			// если свотч пригоден для операции
			if( SWATCH_IS_OK( AD.swatches[i] ) )
			{
				// добавляем в массив для диалога
				SWATCHES.push( AD.swatches[i].name );
				// если свотч является Registration получаем начальный вариант
				if( AD.swatches[i].name == "Registration" ) M_C_INI = SWATCHES.length-1;
			};// if
		};// for
		// создаем дропдаун выбора цвета
		COLOR_DROP = MAKE_DROP( mp, "Color of marks: ", text_dd_w, x, c_drop_y, drop_w, SWATCHES , M_C_INI );
		// строка 8
		// корректировка верха объектов для белого контура
		var w_cont_dy = WM( CSCC( 3, 5 ), 3 );
		// верх для чекбокса для белого контура
		var w_cont_y = c_drop_y + pan_dy + w_cont_dy;
		// ширина поля ввода для ширины белого контура
		w_et_pan = str_w_ed_text_w;
		// дополнительный сдвиг вниз для текста единиц измерения
		dy_t_pan = WM( CSCC( 3, 1 ), 3 );
		// верх для поля ввода для ширины белого контура
		var W_CONT_W_y = w_cont_y - w_cont_dy;
		// создаем поле ввода и текст единиц измерений ширины для белого контура
		W_CONT_W = ED_TEXT( mp, str_w_left, W_CONT_W_y, W_CONT_W_INI, UN_STR_LIST[ SW_UN_INI ] );
		// присваиваем активность и видимость 
		// для поля ввода и текста единиц измерений ширины для белого контура
		W_CONT_ET_ACT();
		//
		// подпрограмма присвоения активности и видимости 
		// для поля ввода и единиц измерения ширины для белого контура
		function W_CONT_ET_ACT()
		{
			// если НЕ создается белый контур 
			if( !W_CONT_INI )
			{
				// в поле ввода присваиваем начальное значение 
				// ширины для белого контура
				W_CONT_W[0].text = W_CONT_W_INI;
			};// if
			// активность и видимость для поля поля ввода
			W_CONT_W[0].enabled = W_CONT_W[0].visible = 
			// активность и видимость для единиц измерения
			W_CONT_W[1].enabled = W_CONT_W[1].visible = 
			// значение чекбокса для белого контура
			W_CONT_INI;
			return;
		};// end W_CONT_ET_ACT
		//
		// создаем чекбокс для белого контура
		W_CONT_CB = MAKE_CB( mp, x, w_cont_y, 200, GET_W_CONT_TEXT(), W_CONT_INI );
		//
		// подпрограмма получения текста подсказки для чекбокса для белого контура
		function GET_W_CONT_TEXT()
		{
			return ( W_CONT_TEXT + ( W_CONT_INI ? ( ":" ) : ( " around marks" ) ) );
		};// end GET_W_CONT_TEXT
		//
		// подпрограмма реакции на нажатие чекбокса для белого контура
		W_CONT_CB.onClick = function()
		{
			// значение чекбокса для белого контура
			W_CONT_INI = W_CONT_CB.value;
			// изменяем текст подсказки для чекбокса
			W_CONT_CB.text = GET_W_CONT_TEXT();
			// изменяем видимость для поля ввода ширины и единиц измерения
			// для белого контура
			W_CONT_ET_ACT();				
			return;
		};// end W_CONT_CB.onClick
		//
		return;
	};// end MAKE_OPTIONS_PANEL
	//
	// собственно создаем панель опций
	MAKE_OPTIONS_PANEL( 180 + WM( CSCC( -13, 0 ) , 8 ), WM( 7, 8 ) );
	//
	// создаем группу (как строка) для выбора объектов и границ и слоя
	var OBJ_BOUNDS_LAYER = MAKE_GROUP( dlg, 'row', 'center' );
	// список объектов для построения меток
	var OBJECTS_ARR = new Array();
	// если на развороте несколько страниц
	if( AS_NP > 1) 
	{
		// каждая страница на активном развороте
		OBJECTS_ARR.push( EACH_PAGE_OPTION );
		// активный разворот (по "крайним" страницам)
		OBJECTS_ARR.push( AS_OPTION );
	};// if
	// активная страница
	OBJECTS_ARR.push( AP_OPTION );
	// если выделен только 1 объект
	if( N_sel == 1 ) OBJECTS_ARR.push( SEL_OBJ_OPTION );
	// если выделено больше 1 объекта
	if( N_sel > 1 ) 
	{
		// выделение целиком
		OBJECTS_ARR.push( ENTIRE_SEL_OPTION );
		// каждый объект в выделении
		OBJECTS_ARR.push( EACH_OBJ_OPTION );
	};// if
	// "переворачиваем" массив объектов чтобы последняя опция стала первой
	OBJECTS_ARR.reverse();
	// создаем дропдаун для выбора объектов
	OBJ_DROP = MAKE_DROP( OBJ_BOUNDS_LAYER, "Object(s):", false, false, false, DD_WIDTH, OBJECTS_ARR, 0 );
	OBJ_DROP.onChange = OBJ_DROP_ON_CHANGE;
	//
	// подпрограмма реакции на изменение дропдауна выбора объектов
	function OBJ_DROP_ON_CHANGE() 
	{
		// значение из дропдауна выбора объектов
		OBJECTS_TO_MAKE =  OBJ_DROP.selection.text;
		// выбранные объекты имеют границы
		OBJ_HAVE_BOUNDS =  
		( (OBJECTS_TO_MAKE == EACH_OBJ_OPTION) || (OBJECTS_TO_MAKE == ENTIRE_SEL_OPTION) || (OBJECTS_TO_MAKE == SEL_OBJ_OPTION ) );
		// если было выделение объектов
		if( N_sel > 0 )
		{
			// активируем/деактивируем дропдаун выбора границ в зависимости от того имеют ли объекты границы
			BOUNDS_INI = DROP_ACTIVE( BOUNDS_DROP, OBJ_HAVE_BOUNDS, BOUNDS_INI );
		};// if
		// выбранные объекты требуют учет наложения ОБЪЕКТОВ
		var OVERLAP = ( (OBJECTS_TO_MAKE == EACH_OBJ_OPTION) || ( OBJECTS_TO_MAKE == EACH_PAGE_OPTION ) );
		// активируем/деактивируем чекбокс учета наложения
		CB_ACTIVE( CONS_OVER_CB, OVERLAP );
		// если выбранные объекты в дропдауне имеют границы
		if( OBJ_HAVE_BOUNDS )
		{
			// проверяем опции для группировки меток
			// если была автоматическая корректировка опции группировки
			// и если опция группировки только меток
			if( ( G_AUTO ) && ( G_M_DROP.selection.index == 1 ) )
			{
				// ставим выделение на группировку меток и выделения
				G_M_DROP.selection = 2;
				// автоматической корректировки как бы не было :)))
				G_AUTO = false;
			};// if;
		}
		// если выбранные объекты в дропдауне НЕ имеют границы
		else
		{
			// проверяем опции для группировки меток если было выделение
			// если не было автоматической корректировки опции группировки
			// и если опция группировки меток и выделения
			if( ( N_sel > 0 ) && ( !G_AUTO ) && ( G_M_DROP.selection.index == 2 ) )
			{
				// ставим выделение на группировку только меток
				G_M_DROP.selection = 1;
				// автоматическая корректировка как бы была :)))
				G_AUTO = true;
			};// if
		};// if-else
		return;
	};// end OBJ_DROP_ON_CHANGE
	//
	// если выделены объекты предлагаем выбор границ
	if( N_sel > 0 ) 
	{
		// создаем дропдаун выбора границ
		BOUNDS_DROP = MAKE_DROP( OBJ_BOUNDS_LAYER, "Bounds:", false, false, false, DD_WIDTH, BOUNDS_LIST, BOUNDS_INI );
	};// if
	//
	// если слоев больше 1 создаем дропдаун выбора слоя
	if( AD_LL > 1 ) 
	{
		// список имен слоев в документе
		var LAYERS_LIST = new Array();
		// индекс активного слоя
		var LAYER_SEL = 0;
		// цикл по слоям документа
		for( var i=0; i < AD_LL; i++ )
		{
			// заполняем список имен слоев
			LAYERS_LIST[i] = AD.layers[i].name;
			// номер активного слоя
			if( AD.layers[i] == AL ) LAYER_SEL = i;
		};// for
		// ширина дропдауна выбора слоя
		var LAYER_DROP_W = DD_WIDTH - WM( CSCC( 13, 11 ), 6 );
		// создаем дропдаун выбора слоя
		LAYER_DROP = MAKE_DROP( OBJ_BOUNDS_LAYER, "Layer:", false, false, false, LAYER_DROP_W, LAYERS_LIST, LAYER_SEL );
	};// if
	// вызываем подпрограмму реакции на изменение дропдауна выбора объектов 
	// чтобы обновить значения в диалоге
	OBJ_DROP_ON_CHANGE();
	// проводим разграничительную линию
	MAKE_LINE_DIAL();
	// создание панели кнопок (кнопка ОК, кнопка Cancel)
	var okPanel = MAKE_GROUP( dlg, 'row', false );
	// кнопка ОК
	okBtn = MAKE_BUTTON( false, false, false, okPanel, 'OK' );
	// кнопка OK активна если есть выбранные направления
	okBtn.enabled = DIR_STATUS( DIR, undefined, false );
	// кнопка Cancel
	var cancelBtn = MAKE_BUTTON( false, false, false, okPanel, 'Cancel' );
	// собственно показываем окно диалога
	var DIALOG_BUTTON = dlg.show();
	// если выбрана первая кнопка (ОК) выполняем
	if( DIALOG_BUTTON == 1 ) 
	{
		// объекты для построения меток
		OBJECTS_TO_MAKE =  OBJ_DROP.selection.text;
		// направления
		for( var i = 0; i < N_dir_dial; i++ )
		{
			// получаем логические значения чекбоксов направлений
			// DIR_INI[i] будут использованы как начальные значения для направлений
			// при записи в файл данных
			DIR_INI[i] = DIR[i].value;
		};// for
		// длина по вертикали
		LENGTH_VER_INI = LENGTH_VER.text;// начальное значение (текст)
		LENGTH_VER = TEXT_TO_DIGIT( LENGTH_VER_INI );// число
		// длина по горизонтали
		LENGTH_HOR_INI = LENGTH_HOR.text;// начальное значение (текст)
		LENGTH_HOR = TEXT_TO_DIGIT( LENGTH_HOR_INI );// число
		// отступ (офсет) по вертикали
		OFFSET_VER_INI = OFFSET_VER.text;// начальное значение (текст)
		OFFSET_VER = TEXT_TO_DIGIT( OFFSET_VER_INI );// число
		// отступ (офсет) по горизонтали
		OFFSET_HOR_INI = OFFSET_HOR.text;// начальное значение (текст)
		OFFSET_HOR = TEXT_TO_DIGIT( OFFSET_HOR_INI );// число
		// вылет по вертикали
		BLEED_VER_INI = BLEED_VER.text;// начальное значение (текст)
		BLEED_VER = TEXT_TO_DIGIT( BLEED_VER_INI );// число
		// вылет по горизонтали
		BLEED_HOR_INI = BLEED_HOR.text;// начальное значение (текст)
		BLEED_HOR = TEXT_TO_DIGIT( BLEED_HOR_INI );// число
		// единицы измерения (начальное значение число) для толщины линии
		SW_UN_INI = str_un_drop.selection.index;
		// толщина линии
		SW_NUM_INI = str_w_ed_text.text; // начальное значение (текст)
		SW_NUM = TEXT_AS_POINTS( SW_NUM_INI, UN_STR_LIST[ SW_UN_INI ] );// число в пунктах
		// белый контур
		W_CONT_INI = W_CONT_CB.value;
		// проверка ширины белого контура
		var BAD_W_CONT = false;
		// если задано построение белого контура
		if( W_CONT_INI )
		{
			// ширина белого контура
			W_CONT_W_INI = W_CONT_W[ 0 ].text; // начальное значение (текст)
			W_CONT_W = TEXT_AS_POINTS( W_CONT_W_INI, UN_STR_LIST[ SW_UN_INI ] );// число в пунктах
			// проверяем введенное значение ширины белого контура
			// оно не может быть меньше или равно 0
			BAD_W_CONT = LE_ZERO( W_CONT_W );
			if( BAD_W_CONT ) 
			{
				BAD_VAL_TEXT += W_CONT_TEXT + " width" + CAN_NOT_BE + "\n";
			};// if
			// ширина белого контура для построения меток с учетом толщины линии
			W_CONT_W = SW_NUM + W_CONT_W * 2;
		};// if
		// проверяем введенные значения длины меток по вертикали и горизонтали
		// они не могут быть меньше или равны 0
		var BAD_VAL_L = ( LE_ZERO( LENGTH_VER ) || LE_ZERO( LENGTH_HOR ) );
		if( BAD_VAL_L ) 
		{
			BAD_VAL_TEXT +=  "Crop mark length"+ CAN_NOT_BE + "\n";
		};// if
		// проверяем введенное значение толщины линии
		// оно не может быть меньше или равно 0
		var BAD_SW = LE_ZERO( SW_NUM );
		if( BAD_SW ) 
		{
			BAD_VAL_TEXT += SW_TEXT + CAN_NOT_BE + "\n";
		};// if
		// если есть ошибки ввода выход
		if( BAD_VAL_L || BAD_SW  || BAD_W_CONT  ) 
		{
			alert( BAD_VAL_TEXT );
			return;
		};// if
		// группировать метки и выделение индекс для начального значения
		G_M_INI = G_M_DROP.selection.index;
		// границы объектов для построения
		// если есть выделенные объекты берем опцию из дропдауна границ
		// если нет выделения оставляем полученное начальное значение
		BOUNDS_INI = ( N_sel > 0 ) ? BOUNDS_DROP.selection.index : BOUNDS_INI;
		// слой для построения
		if( AD_LL > 1 ) 
		{
			SL = AD.layers[ LAYER_DROP.selection.index ];
		};// if
		// запоминать направления
		REM_DIR = REM_DIR_CB.value;
		// учитывать наложение объектов
		CONS_OVER = CONS_OVER_CB.value;
		// значение для цвета меток
		COLOR_VAL = COLOR_DROP.selection.index;
		// выполнение операции построения меток
		OPERATION();
		// записываем начальные значения в файл
		INI_FILE_IO( true );
	};// if DIALOG_BUTTON == 1
	// завершение работы штатное (выход)
	the_exit("");
	return;
};// end main()
//
// подпрограмма выполнения скрипта (в диалоге был ОК)
function OPERATION() 
{
	// проверяем если цвет меток "бумага"
	var MARKS_PAPER = false;
	var MARKS_PAPER_MSG = "";
	// если выбранный цвет меток "бумага" 
	if( SWATCHES[ COLOR_VAL ] == "Paper" )
	{
		MARKS_PAPER = true;
		MARKS_PAPER_MSG = "Chosen color of marks is Paper!\n";
	};// if
	var PAPER_NOT_WHITE = false;
	var PAPER_NOT_WHITE_MSG = "";
	var CONTOUR_PAPER = false;
	// цвет меток
	M_COLOR = AD.swatches.itemByName( SWATCHES[ COLOR_VAL ] );
	// если задан "белый" контур вокруг меток
	if( W_CONT_INI )
	{
		// определяем "белый" цвет в зависимости от цветовой модели цвета меток
		switch( M_COLOR.model )
		{
			// если цвет меток Registration или спот
			case( ColorModel.REGISTRATION ):
			case( ColorModel.SPOT ):
			case( ColorModel.MIXEDINKMODEL ): 	
				// "белый" цвет не используем, при создании контура даем 0% от цвета меток
				WHITE = false;
			break;
			// если цвет меток "обычный" свотч и во всех остальных случаях
			case( ColorModel.PROCESS ):
			default:
				// определяем "белый" цвет как цвет "бумаги"
				CONTOUR_PAPER = true;
				WHITE = AD.swatches.itemByName( "Paper" );
			break;
		};// switch
	};// if
	// если выбранный цвет меток "бумага" или цвет контура "бумага"
	// проверяем установлен ли свотч "бумага" в белый цвет
	if( MARKS_PAPER || CONTOUR_PAPER )
	{
		// если метки "бумага"  тогда "белый" для проверки это цвет меток
		// если контур "бумага" тогда "белый" для проверки это цвет контура
		var THE_WHITE = ( MARKS_PAPER ) ? M_COLOR : WHITE;
		// если сумма компонентов "белого" "бумаги" не равна 0
		if( (THE_WHITE.colorValue[0] + THE_WHITE.colorValue[1] + THE_WHITE.colorValue[2] + THE_WHITE.colorValue[3]) != 0 )
		{
			PAPER_NOT_WHITE = true;
			PAPER_NOT_WHITE_MSG = "Paper color is not set to white!\n";
		};// if
	};// if
	// если выбранный цвет меток "бумага" или свотч "бумага" не установлен в белый цвет
	if( MARKS_PAPER || PAPER_NOT_WHITE )
	{
		// выводим предупреждение если метки "бумага" или контур "бумага" и "бумага" не белая
		if( !( confirm( MARKS_PAPER_MSG + PAPER_NOT_WHITE_MSG + "\nContinue?" ) ) )
		{
			the_exit("");
		};// if
	};// if		
	// если выбранный слой невидим показываем его
	if( !SL.visible ) SL.visible = true;
	// если выбранный слой заблокирован разблокируем его
	if( SL.locked ) SL.locked = false;
	//
	// начинаем выполнение команд из диалога
	//
	// ставим единицы измерения для обводки как пункты для построения меток
	try{ AD.viewPreferences.strokeMeasurementUnits = UN_LIST[0][0]; } catch( error ) {};
	//
	// объект для построения меток - активная полоса
	if( OBJECTS_TO_MAKE == AP_OPTION )
	{
		MARKS( AP.bounds );
	};// if
	//
	// объект для построения меток - активный разворот
	if( OBJECTS_TO_MAKE == AS_OPTION )
	{
		// используем массив для размеров выделения
		SEL_SIZE = new Array( N_dir );
		// получаем габаритные размеры активного разворота
		// по размерам "крайних" страниц
		// цикл по страницам разворота
		for( var i = 0; i < AS_NP; i++ ) 
		{
			// цикл по направлениям 0=верх 1=лево 2=низ 3=право
			for( var dir = 0; dir < N_dir; dir++ )
			{
				SEL_SIZE[dir] = COMPARE_BOUNDS( dir, i, SEL_SIZE[dir], AS.pages[i].bounds[dir] );
			};// for dir
		};// for i
		// строим метки по габаритам активного разворота
		MARKS( SEL_SIZE );
	};// if
	//
	// объекты для построения меток - каждая страница на активном развороте
	if( OBJECTS_TO_MAKE == EACH_PAGE_OPTION )
	{
		// если задан учет наложения объектов (страниц на активном развороте)
		if( CONS_OVER )
		{
			// переопределяем массив размеров объектов 
			// для размеров страниц
			OBJ_SIZE = new Array( AS_NP );
			// переприсваиваем (формально) количество объектов для обработки
			N_sel = AS_NP;
			// цикл по всем страницам для получения размеров
			for( var i = 0; i < AS_NP; i++ )
			{
				// в массивы размеров объектов записываем размеры страниц
				OBJ_SIZE[ i ] = AS.pages[ i ].bounds;
			};// for i
		};// if
		// цикл по страницам разворота
		for( OBJ_i = 0; OBJ_i < AS_NP; OBJ_i++ ) 
		{
			// строим метки по габаритам текущей страницы
			MARKS( AS.pages[ OBJ_i ].bounds );
		};// for i
	};// if
	//
	// объект для построения меток - выделение целиком или выделен только один объект
	if( (OBJECTS_TO_MAKE == ENTIRE_SEL_OPTION) || (OBJECTS_TO_MAKE == SEL_OBJ_OPTION) )
	{
		// строим метки по габаритным размерам 
		MARKS( SEL_SIZE[ BOUNDS_INI ] );
	};// if
	//
	// объект для построения меток - каждый объект в выделении
	if( OBJECTS_TO_MAKE == EACH_OBJ_OPTION )
	{
		// переприсваиваем массив размеров чтобы можно было его использовать
		// для возможного учета наложения
		OBJ_SIZE = OBJ_SIZE[ BOUNDS_INI ];
		// цикл по объектам в выделении
		for( OBJ_i = 0; OBJ_i < N_sel; OBJ_i++ ) 
		{
			// строим метки по габаритам каждого объекта в выделении
			MARKS( OBJ_SIZE[ OBJ_i ] );
		};// for
	};// if
	// если задана группировка после создания меток
	if( G_M_INI != 0 )
	{
		// ошибка группировки
		var g_err = false;
		// если задана группировка только меток или меток и выделенных объектов
		// сначала группируем метки создаем группу для меток
		try
		{
			// если меток больше одной группируем массив меток
			// если метка только одна, тогда группа меток это метка :)))
			var G_M = ( ALL_MARKS.length > 1 ) ? ( AS.groups.add( ALL_MARKS ) ) : ( ALL_MARKS[0] );
		} catch( error ) { g_err = true };// try-catch
		// если задана группировка меток и выделения
		// группируем метки и выделение
		if( G_M_INI == 2 )
		{
			// снимаем выделение
			AD.selection = null;
			// группируем выделение
			try
			{
				// если в выделении один объект, тогда группа объектов это объект :)))
				// если в выделении несколько объектов группируем их
				var G_S = ( N_sel == 1 ) ? ( the_sel[0] ) : ( AS.groups.add( the_sel ) );
			} catch( error ) { g_err = true };// try-catch
			// группируем выделение и метки
			try
			{
				var G = AS.groups.add( [G_S, G_M] );
			} catch( error ) { g_err = true };// try-catch
			// выделяем новую группу
			try
			{
				G.select( SelectionOptions.addTo );
			} catch( error ) { g_err = true };// try-catch
		};// if
		// если была ошибка группировки
		if( g_err )
		{
			// выводим сообщение
			alert("Can not group!");
			try
			{
				// возвращаем начальное выделение в документе
				AD.selection = the_sel;
			} catch( error ) {};// try-catch
		};// if
		// для записи в файл данных учитываем возможную 
		// автоматическую корректировку опции для группировки
		if( G_AUTO && ( G_M_INI == 1 ) )
		{
			// присваиваем "старое" значение для группировки меток и выделения
			G_M_INI = 2;
		};// if
	};// if
	return;
};// end OPERATION
//
// подпрограмма создания меток вокруг объекта
function MARKS( BOUNDS_ARR )
{
	// массив габаритов меток для текущего объекта
	var M = new Array( N_dir_dial );
	//
	// подпрограмма присвоения значений массивам размеров меток
	// hor: true - горизонтальные метки (слева и справа), false - вертикальные метки (сверху и снизу)
	function M_SET( hor )
	{
		// начальный индекс чекбокса
		var N = ( hor ) ? ( 0 ) : ( 6 );
		// вылеты
		var BLEED = ( hor ) ? ( BLEED_VER ) : ( BLEED_HOR );
		// отступы
		var OFFS = ( hor ) ? ( OFFSET_HOR ) : ( -OFFSET_VER );
		// длина метки
		var LEN = ( hor ) ? ( LENGTH_HOR ) : ( -LENGTH_VER );
		// массив индексов для направлений
		var D = ( hor ) ? [ 0, 2, 0, 2 ] : [ 1, 1, 3, 3 ];
		// массив одинаковых значений позиций меток
		// эти позиции одинаковые для пар меток: лево-право и верх-низ
		var SAME_POS = 
		[
			// если горизонтальные метки: левая верхняя, правая верхняя - верх и низ
			// если вертикальные метки: верхняя левая, нижняя левая - лево и право
			( BOUNDS_ARR[ D[0] ] + BLEED ),
			// если горизонтальные метки: левая центр, правая центр - верх и низ
			// если вертикальные метки: верхняя центр, нижняя центр - лево и право
			GET_CENTER( BOUNDS_ARR[ D[2] ], BOUNDS_ARR[ D[1] ] ),
			// если горизонтальные метки: левая нижняя, правая нижняя - верх и низ
			// если вертикальные метки: верхняя правая, нижняя правая - лево и право
			( BOUNDS_ARR[ D[3] ] - BLEED )
		];
		// массив индексов для направлений
		D = ( hor ) ? [ 0, 2, 1, 3 ] : [ 1, 3, 2, 0 ];
		// количество чекбоксов на каждой стороне
		var N_cb = 3;
		// цикл по чекбоксам
		for( var i = N; i < ( N + N_cb ); i++ )
		{
			// индекс противоположной метки
			var i_N_cb = i + N_cb;
			// описываем элементы массива меток
			// как массивы координат
			M[ i ] = new Array( N_dir );// текущая метка
			M[ i_N_cb ] = new Array( N_dir );// противоположная метка
			// если горизонтальные метки: верх и низ
			// если вертикальные метки: лево и право
			// с одной стороны (слева или снизу)
			M[ i ][ D[ 0 ] ] = M[ i ][ D[ 1 ] ] = 
			// с противоположной стороны (справа или сверху)
			M[ i_N_cb ][ D[ 0 ] ] = M[ i_N_cb ][ D[ 1 ] ] =
			// одинаковые значения
			SAME_POS[ i - N ];
			// если горизонтальные метки: право и лево
			// если вертикальные метки: низ и верх
			// с одной стороны (слева или снизу)
			M[ i ][ D[ 3 ] ] = BOUNDS_ARR[ D[ 2 ] ] - OFFS;
			M[ i ][ D[ 2 ] ] = M[ i ][ D[ 3 ] ] - LEN;
			// с противоположной стороны (справа или сверху)
			M[ i_N_cb ][ D[ 2 ] ] = BOUNDS_ARR[ D[ 3 ] ] + OFFS;
			M[ i_N_cb ][ D[ 3 ] ] = M[ i_N_cb ][ D[ 2 ] ] + LEN;
		};// for
		return;
	};// end M_SET
	//
	//	индексы меток и чекбоксов
	//
	//		9	10	11
	// 	0					3
	//	1					4
	//	2					5
	//		6	7	8
	//
	// определяем координаты горизонтальных меток
	M_SET( true );
	// определяем координаты вертикальных меток
	M_SET( false );
	//
	// цикл по меткам (чекбоксам) вокруг объекта
	for( var m = 0; m < N_dir_dial; m++ )
	{
		// если чекбокс был нажат 
		if( DIR_INI[ m ] )
		{
			// из текущего индекса m определяем ориентацию метки:
			// горизонтальная или вертикальная
			// индекс для горизонтальных меток ( 0-5 ) hor = true
			// индекс для вертикальных меток ( 6-11 ) hor = false
			var hor = ( ( m >= 0 ) && ( m <= 5 ) );
			// наложение текущей метки с другими ОБЪЕКТАМИ
			var OVER_OBJ = false;
			// если задан учет наложения ОБЪЕКТОВ
			if( CONS_OVER )
			{
				// цикл по "другим" объектам
				for( var i = 0; i < N_sel; i++ )
				{
					// пропускаем если индекс текущего "другого" объекта совпадает 
					// с индексом проверяемого объекта
					if( i == OBJ_i ) continue;
					// массив габаритов текущего "другого" объекта с учетом отступов и точности
					// точность направлена "внутрь" объекта для того чтобы лучше метка
					// была построена, чем НЕ построена :)))
					var S =
					[
						// верхняя граница текущего объекта с учетом отступа и точности
						( OBJ_SIZE[i][0] - OFFSET_VER + PREC_MARKS_OBJ ),
						// левая граница текущего объекта с учетом отступа и точности
						( OBJ_SIZE[i][1] - OFFSET_HOR + PREC_MARKS_OBJ ),
						// нижняя граница текущего объекта с учетом отступа и точности
						( OBJ_SIZE[i][2] + OFFSET_VER - PREC_MARKS_OBJ ),
						// правая граница текущего объекта с учетом отступа и точности
						( OBJ_SIZE[i][3] + OFFSET_HOR - PREC_MARKS_OBJ )
					];
					// M_m - массив габаритов будущей метки вокруг проверяемого объекта 
					// учитываем точность PREC_MARKS_OBJ для "уменьшения" габаритов метки,
					// чтобы она лучше была построена, чем НЕ построена :)))
					var M_m = 
					[ 
						// верхняя граница метки с учетом точности
						( M[m][0] + PREC_MARKS_OBJ ), 
						// левая граница метки с учетом точности
						( M[m][1] + PREC_MARKS_OBJ ), 
						// нижняя граница метки с учетом точности
						( M[m][2] - PREC_MARKS_OBJ ),
						// правая граница метки с учетом точности
						( M[m][3] - PREC_MARKS_OBJ )
					];
					// проверяем возможность построения метки
					// если невозможно построить метку дальше не проверяем по "другим" объектам
					if( ( OVER_OBJ = OVERLAP( S, M_m ) ) === true ) break;
				};// for i
			};// if CONS_OVER
			// если НЕ было наложения "других" объектов на габариты новой метки
			// или НЕ задан учет наложения ОБЪЕКТОВ
			if( !OVER_OBJ ) 
			{
				// собственно строим новую метку
				MAKE_CROP_MARK( hor, M[m] );
			};// if
		};// if DIR_INI[ m ]
	};// for m
	return;
};// end MARKS
//
// подпрограмма создания горизонтальной или вертикальной метки реза
// hor = true: горизонтальная метка, hor = false: вертикальная метка
// BOUNDS_ARR - массив границ МЕТКИ
function MAKE_CROP_MARK( hor, BOUNDS_ARR )
{
	// если метка с заданными размерами на "этом" месте создана тогда выход
	if( ALREADY_MADE( BOUNDS_ARR ) ) return;
	// мастер-объект для метки (горизонтальный или вертикальный)
	var MASTER = ( hor ) ? MASTER_HOR : MASTER_VER;
	// если мастер-объект для метки НЕ создан
	if( MASTER[0] === false )
	{
		// создаем новую метку
		var the_mark = MAKE_MARK( BOUNDS_ARR );
	}
	else
	// если мастер-объект для метки уже создан
	{
		try
		{
			// дублируем мастер (новая метка = копия мастера)
			var the_mark = MASTER[0].duplicate();
			// центр мастера по горизонтали (X)
			var mx = GET_CENTER( MASTER[1][1], MASTER[1][3] );
			// центр мастера по вертикали (Y)
			var my = GET_CENTER( MASTER[1][0], MASTER[1][2] );
			// лево или верх новой метки
			var LT = ( hor ) ? ( BOUNDS_ARR[1] ) : ( BOUNDS_ARR[0] );
			// право или низ новой метки
			var RB = ( hor ) ? ( BOUNDS_ARR[3] ) : ( BOUNDS_ARR[2] );
			// вертикаль или горизонталь новой метки
			var XY = ( hor ) ? ( BOUNDS_ARR[0] ) : ( BOUNDS_ARR[1] );
			// перемещение новой метки по горизонтали (X)
			var dx = ( ( hor ) ? ( GET_CENTER( LT, RB ) ) : XY ) - mx;
			// перемещение новой метки по вертикали (Y)
			var dy = ( ( hor ) ? XY : ( GET_CENTER( LT, RB ) ) ) - my;
			// собственно перемещаем новую метку
			the_mark.move( undefined, [ dx, dy ] );
		} catch( error ) {};// try-catch
	};// if-else
	// присваиваем новый мастер и его размеры
	MASTER = [ the_mark, BOUNDS_ARR ];
	// для горизонтальной метки
	if( hor ) 
	{
		MASTER_HOR = MASTER;
	}
	// для вертикальной метки
	else 
	{
		MASTER_VER = MASTER;
	};// if-else
	// если задана группировка после создания меток
	if( G_M_INI != 0 )
	{
		// заносим полученный объект в массив всех меток
		ALL_MARKS.push( the_mark );
	};// if
	// заносим координаты полученного объекта (метки) в массив
	ALL_MARKS_BOUNDS.push( BOUNDS_ARR );
	return;
};// end MAKE_CROP_MARK
//
// подпрограмма создания метки
// BOUNDS_ARR - массив размеров новой метки
function MAKE_MARK( BOUNDS_ARR )
{
	// если задан белый контур
	if( W_CONT_INI ) 
	{
		// сначала делаем расширенную "белую" линию
		var W_L = MAKE_LINE( BOUNDS_ARR, false, W_CONT_W );
	};// if
	// собственно делаем линию цветом меток
	var R_L = MAKE_LINE( BOUNDS_ARR, true, SW_NUM );
	try
	{
		// если задан белый контур создаем группу из белой и линии цветом меток
		// если НЕ задан белый контур возвращаем линию цвета меток
		var the_mark = ( W_CONT_INI ) ? ( AS.groups.add( [ W_L, R_L ] ) ) : ( R_L );
	} catch( error ) {};// try-catch
	// возвращаем метку
	return the_mark;
};// end MAKE_MARK
//
// подпрограмма присвоения цвета обводки и толщины линии
function SET_COLOR_WEIGHT( the_obj, the_color, the_weight )
{
	// подпрограмма присвоения цвета и оттенка
	function COLOR_TINT_WEIGHT( obj_color, obj_tint )
	{
		try 
		{ 
			// присваиваем толщину линии
			the_obj.strokeWeight = the_weight;
			// присвоение цвета
			the_obj.strokeColor = obj_color;
			// присвоение оттенка
			the_obj.strokeTint = obj_tint;
		} catch( error ) {};
		return;
	};// end COLOR_TINT_WEIGHT
	//
	// если присвоение цвета меток
	if( the_color == true )
	{
		COLOR_TINT_WEIGHT( M_COLOR, -1 );
	}
	// если присвоение цвета контура вокруг меток
	else
	{
		// если "белый" цвет задается как 0% оттенок от цвета меток
		// для Registration или спотов
		if( WHITE === false )
		{
			COLOR_TINT_WEIGHT( M_COLOR, 0 );
		}
		// если "белый" задается как "бумага" для "обычных" свотчей
		else
		{
			COLOR_TINT_WEIGHT( WHITE, -1 );
		};// if-else
	};// if-else
	return;
};// end SET_COLOR_WEIGHT
//
// подпрограмма создания линии
// BOUNDS_ARR - массив геометрических границ
// the_color - цвет обводки
// the_weight - толщина обводки
function MAKE_LINE( BOUNDS_ARR, the_color, the_weight )
{
	try
	{
		// свойства для новой линии
		var the_line_props = 
		{
			// выбранный слой
			itemLayer: SL, 
			// геометрические границы
			geometricBounds: BOUNDS_ARR,
			// самый первый объектный стиль [None] в активном документе
			// без дополнительных эффектов
			appliedObjectStyle: AD.objectStyles.firstItem()
		};
		// создаем новую линию на активном развороте
		var the_line = AS.graphicLines.add( the_line_props );
		// присваиваем цвет обводки и толщину линии
		SET_COLOR_WEIGHT( the_line, the_color, the_weight );
		// возвращаем линию
		return the_line;
	} catch ( error ) {};
};// end MAKE_LINE
// 
// подпрограмма проверки наложения объектов
// A, B - массивы границ проверяемых объектов
function OVERLAP( A, B )
{
	// подпрограмма проверки наложения
	// hor: true - по горизонтали, false - по вертикали
	function OVER( hor )
	{
		// массив индексов для направлений
		// если проверка по горизонтали - лево (1) и право (3)
		// если проверка по вертикали - верх (0) и низ (2)
		var D = ( hor ) ? [ 1, 3 ] : [ 0, 2 ];
		// если левая граница А в ширине B (если нижняя граница А в высоте B)
		if( ( (A[ D[ 0 ] ] >= B[ D[ 0 ] ]) && (A[ D[ 0 ] ] <= B[ D[ 1 ] ]) ) ) return true;
		// если левая граница B в ширине A (если нижняя граница B в высоте A)
		if( ( (B[ D[ 0 ] ] >= A[ D[ 0 ] ]) && (B[ D[ 0 ] ] <= A[ D[ 1 ] ]) ) ) return true;
		// если правая граница А в ширине B (если верхняя граница А в высоте В)
		if( ( (A[ D[ 1 ] ] >= B[ D[ 0 ] ]) && (A[ D[ 1 ] ] <= B[ D[ 1 ] ]) ) ) return true;
		// если правая граница B в ширине A (если верхняя граница B в высоте A)
		if( ( (B[ D[ 1 ] ] >= A[ D[ 0 ] ]) && (B[ D[ 1 ] ] <= A[ D[ 1 ] ]) ) ) return true;
		return false;
	};// end OVER
	//
	// если было наложение по вертикали и горизонтали метку построить невозможно
	if( OVER( true ) && OVER( false ) ) return true;
	return false;
};// end OVERLAP
//
// подпрограмма проверки создана ли уже метка
// BOUNDS_ARR - массив координат "новой" метки
function ALREADY_MADE( BOUNDS_ARR )
{
	// цикл по массиву сделанных меток
	for( var i = 0; i < ALL_MARKS_BOUNDS.length; i++ )
	{
		try
		{
			// массив границ текущей сделанной метки
			var M = ALL_MARKS_BOUNDS[i];
			// была ли сделана текущая метка
			// начальное присвоение истина потому что дальше идет цикл
			// проверки по направлениям и в нем && (логическое умножение)
			// то есть если хотя бы по одному направлению нет совпадения (ложь)
			// тогда результирующее значение будет ложь - на "этом" месте метка не сделана
			var MADE = true;
			// цикл по направлениям
			for( var dir = 0; dir < N_dir; dir++ )
			{
				// проверяем расхождение координат по текущему направлению
				// если расхождение хотя бы по одному направлению больше тогда считаем
				// что метка на заданном месте НЕ построена
				MADE = ( MADE && ( Math.abs( M[dir] - BOUNDS_ARR[dir] ) <= PREC_MARKS ) );
				// если расхождение хотя бы по одному направлению выход из цикла по направлениям
				// и проверка для следующей сделанной метки
				if( !MADE ) break;
			};// for dir
			// если метка была сделана возвращаем истина
			if( MADE ) return true;
		} catch( error ){};// try-catch
	};// for i
	// если условия не выполнились считаем что метка еще не создана
	return false;
};// end ALREADY_MADE
//
// подпрограмма получения имен для страниц активного разворота
function GET_AS_PAGES_NAMES()
{
	var P_NAMES = "";
	var P_TEXT = "Page";
	// если страниц больше 1 то учитываем множественное число
	if( AS_NP > 1 ) P_TEXT = P_TEXT +"s";
	P_TEXT = P_TEXT +": ";
	// цикл по страницам разворота
	for( var i = 0; i < AS_NP; i++ )
	{
		// имя текущей страницы
		var the_name = unescape( AS.pages[i].name );
		// если только 1 страница на развороте
		if( AS_NP == 1) 
		{
			P_NAMES = P_NAMES + the_name;
			// сразу выход из цикла чтобы не добавлять дефис
			break;
		};// if
		// для первой страницы
		if( i == 0)
		{
			P_NAMES = P_NAMES + the_name;
			// сразу в начало цикла чтобы не добавлять дефис
			continue;
		};// if
		// добавляем дефис
		P_NAMES = P_NAMES + "-" + the_name;
	};// for
	// собственно строка сформирована
	P_NAMES = unescape( P_TEXT + P_NAMES );
	return P_NAMES;
};// end GET_AS_PAGES_NAMES
// 
// подпрограмма проверки является ли свотч из документа
// пригодным для операции
function SWATCH_IS_OK( the_swatch )
{
	try
	{
		if( the_swatch.hasOwnProperty( "model" ) ) return true
		else return false;
	}
	catch( error )
	{
		return false;
	};// try-catch
};// end SWATCH_IS_OK
//
// подпрограмма проверки выделения
function CHECK_SELECTION() 
{
	// выход если нет открытых документов
	if( app.documents.length == 0 ) 
	{
		alert( "There are no open documents!");
		exit();
	};// if
	// активный документ
	AD = app.activeDocument;
	// активный слой
	AL = AD.activeLayer;
	// начальное присвоение выбранного слоя
	SL = AL;
	// количество слоев в активном документе
	AD_LL = AD.layers.length;
	// активный разворот
	AS = app.activeWindow.activeSpread;
	// число страниц на активном развороте
	AS_NP = AS.pages.length;
	// является ли активный разворот мастером
	var AS_IS_MASTER = ( AS.constructor.name == "MasterSpread" );
	// получаем имя активного разворота
	// если активный разворот является мастером тогда получаем имя разворота
	// если активный разворот НЕ является мастером тогда получаем номер разворота
	var AS_NAME = ( AS_IS_MASTER ) ? ( unescape( AS.name ) ) : ( "#"+( AS.index + 1 ).toString() );
	// проверка поворота вида (отображения) активного разворота
	var AS_VIEW_ROT = false;
	// цикл по страницам активного разворота
	for( var i = 0; i < AS_NP; i++ )
	{
		// текущая страница
		var AS_PAGE_i = AS.pages[i];
		try
		{
			// если вид (отображение) текущей страницы может быть повернут
			if( AS_PAGE_i.hasOwnProperty( "transformValuesOf" ) )
			{
				// угол поворота вида (отображения) текущей страницы активного разворота
				var AP_VIEW_ANGLE = 
				AS_PAGE_i.transformValuesOf( CoordinateSpaces.pasteboardCoordinates )[0].counterclockwiseRotationAngle;
				// если вид (отображение) текущей страницы активного разворота повернуто (угол поворота не 0)
				if( AP_VIEW_ANGLE != 0 )
				{
					// тогда есть поворот вида (отображения) активного разворота
					AS_VIEW_ROT = true;
					break;
				};// if
			};// if
		} catch( error ) {};// try-catch
	};// for
	// если вид (отображение) активного разворота повернуто (угол поворота не 0)
	if( AS_VIEW_ROT  )
	{
		// строка пути к пункту меню "Очистить поворот" в палитре "Страницы"
		// для версии CS6 и новее добавляется Page Attributes
		var MENU = ( APP_VERSION >= 8 ) ? "Page Attributes -> " : "";
		// строка предупреждения
		var AS_ROT_WARNING = 
		"Warning!\n\n" +
		"Most likely the active spread's view\n" +
		"(Spread " + AS_NAME + ") is rotated.\n" +
		"To avoid incorrect outcome is strictly recommended\n" +
		"to clear the rotation before in the Pages palette:\n" +
		MENU + "Rotate Spread View –> Clear Rotation.\n\n" +
		"Continue anyway (not recommended) ?";
		// выводим предупреждение
		if( !confirm( AS_ROT_WARNING ) )
		{
			// если НЕТ подтверждения на продолжение тогда выход
			exit();
		};// if
	};// if
	// активная страница
	AP = app.activeWindow.activePage;
	// получаем опцию для активной страницы 
	AP_OPTION = AP_OPTION + 
	// добавляем имя активной страницы
	" (" + ( unescape( AP.name ) ) +
	// если активный разворот является мастером тогда добавляем номер страницы и имя разворота
	//  если активный разворот НЕ является мастером тогда НЕ добавляем ничего :)))
	( ( AS_IS_MASTER ) ?  ( " #" + ( AP.index + 1 ).toString() + " on " + AS_NAME ) : ( "" ) ) + ")";
	// дополняем имя активного разворота именами страниц
	AS_NAME = " (" + AS_NAME + " " + GET_AS_PAGES_NAMES() + ")";
	// получаем опцию для активного разворота
	AS_OPTION = AS_OPTION + AS_NAME;
	// получаем опцию для каждой страницы на активном развороте
	EACH_PAGE_OPTION = EACH_PAGE_OPTION + AS_NAME;
	// выделение в активном документе
	the_sel = AD.selection;
	// число объектов в выделении
	N_sel = the_sel.length;
	// проверяем настройки координат = разворот
	RULERS_SPREAD = ( AD.viewPreferences.rulerOrigin == RulerOrigin.spreadOrigin );
	// единицы измерения по горизонтали
	H_UNITS_TEXT = GET_RULER_UNITS_TEXT( AD.viewPreferences.horizontalMeasurementUnits );
	// единицы измерения по вертикали
	V_UNITS_TEXT = GET_RULER_UNITS_TEXT( AD.viewPreferences.verticalMeasurementUnits );
	// сохраняем начальные настройки документа
	SAVE_INI_DOC_SETTINGS();
	// если настройки отсчета НЕ разворот
	if( !RULERS_SPREAD )
	{
		// устанавливаем настройки отсчета как разворот
		AD.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
	};// if
	// если есть выделенные объекты
	if( N_sel > 0 )
	{
		// если выделены направляющие
		if( the_sel[0].constructor.name == "Guide" ) 
		{
			// формально ошибка при обработке выделения
			exit_if_bad_sel = true;
			// выход
			the_exit( "There are some selected guides!\nCan not process that!" );
		};// if
		// получаем параметры выделения
		SELECTION_DIM();
		// если была ошибка при обработке выделения выход
		if( exit_if_bad_sel ) the_exit( "Can not process the selection!" );
	};// if
	// получаем опцию для каждого объекта в выделении
	EACH_OBJ_OPTION = EACH_OBJ_OPTION + " (" + N_sel.toString() + " objects)";
	return;
};// end CHECK_SELECTION
//
// подпрограмма вычисления размеров выделения
// для обычных объектов
function SELECTION_DIM() 
{
	// определяем размерности массивов 
	// для каждого выделенного объекта
	// 0 = геометрические границы, 1 = визуальные границы => размерность 2
	OBJ_SIZE = new Array( Array( N_sel ), Array( N_sel ) );
	// габариты всего выделения
	// 0 = геометрические границы, 1 = визуальные границы => размерность 2
	SEL_SIZE = new Array( Array( N_dir ), Array( N_dir ) );
	try 
	{
		// цикл по объектам в выделении
		for( var i = 0; i < N_sel; i++ ) 
		{
			// текущий объект в выделении
			var the_sel_i = the_sel[i];
			// границы текущего объекта
			var BOUNDS_i = OBJ_BOUNDS( the_sel_i );
			// если была ошибка при получении размеров выход
			if( BOUNDS_i === false )
			{
				exit_if_bad_sel = true;
				break;
			};// if
			// цикл по виду границ 0=геометрические 1=визуальные
			for( var b = 0; b < N_b; b++ )
			{
				OBJ_SIZE[b][i] = BOUNDS_i[b];
				// цикл по направлениям 0=верх 1=лево 2=низ 3=право
				for( var dir = 0; dir < N_dir; dir++ )
				{
					SEL_SIZE[b][dir] = COMPARE_BOUNDS( dir, i, SEL_SIZE[b][dir], OBJ_SIZE[b][i][dir] );
				};// for dir
			};// for b
		};// for i
	} 
	// если ошибка при определении границ выход
	catch( error ) 
	{
		exit_if_bad_sel = true;
	};// try-catch
	return;
};// end SELECTION_DIM
//
// подпрограмма получения границ выделенного объекта
function OBJ_BOUNDS( the_obj ) 
{
	// массив размеров на выходе
	// 0 - верх геометрические границы
	// 1 - лево геометрические границы
	// 2 - низ геометрические границы
	// 3 - право геометрические границы
	// 4 - верх визуальные границы
	// 5 - лево визуальные границы
	// 6 - низ визуальные границы
	// 7 - право визуальные границы
	var B = new Array( N_dir_b );
	try 
	{
		// цикл по направлениям 0=верх 1=лево 2=низ 3=право
		for( var dir = 0; dir < N_dir; dir++ )
		{
			// геометрические границы
			B[dir] = the_obj.geometricBounds[dir];
			// визуальные границы
			B[dir+N_dir] = the_obj.visibleBounds[dir];
		};// for
	} 
	catch( error ) 
	{
		return false;
	};// try-catch	
	// возвращаем массив из двух массивов:
	// 0 - геометрические границы, 1 - визуальные границы
	return [ [ B[0], B[1], B[2], B[3] ], [ B[4], B[5], B[6], B[7] ] ];
};// end OBJ_BOUNDS
//
// подпрограмма сравнения габаритных размеров 
// в массиве размеров объектов
// dir - направление 0=верх 1=лево 2=низ 3=право
// i - индекс объекта в массиве объектов
// m - текущее значение габаритного размера (минимум или максимум)
// для заданного направления
// b_i - текущий элемент массива размеров
// если индекс объекта 0, тогда габаритный размер = b_i
// (текущему размеру), потому что не с чем сравнивать :)
function COMPARE_BOUNDS( dir, i, m, b_i )
{
	// габаритный размер по заданному направлению
	// начальное присвоение = текущий элемент массива размеров
	var s = b_i;
	// если индекс объекта НЕ равен 0 (значит есть с чем сравнивать :)))
	if( i != 0 )
	{
		// если направление верх (0) или лево (1) тогда определяем минимальное 
		// значение из текущего минимума и текущего размера
		// если направление низ (2) или право (3) тогда определяем максимальное
		// значение из текущего максимума и текущего размера
		s = ( (dir == 0) || (dir == 1) ) ? Math.min( m, b_i ) : Math.max( m, b_i );
	};// if
	// возвращаем габаритный размер по заданному направлению
	// если индекс объекта был 0, тогда сразу возвращается текущий размер
	return s;
};// end COMPARE_BOUNDS
//
// подпрограмма сохранения начальных настроек документа
function SAVE_INI_DOC_SETTINGS() 
{
	// если настройки отсчета НЕ разворот
	if( !RULERS_SPREAD )
	{
		// сохраняем начальные настройки отсчета (страница или разворот)
		try { AD_ini_ruler_origin = AD.viewPreferences.rulerOrigin; } catch( error ) {};
	};// if
	// сохраняем начальные настройки единиц для обводки
	try { AD_ini_str_units = AD.viewPreferences.strokeMeasurementUnits; } catch( error ) {};
	return; 
};// end SAVE_INI_DOC_SETTINGS
//
// подпрограмма восстановления начальных настроек документа
function RESTORE_INI_DOC_SETTINGS() 
{
	// если настройки отсчета НЕ разворот
	if( !RULERS_SPREAD )
	{
		// восстанавливаем начальные настройки отсчета
		try { AD.viewPreferences.rulerOrigin = AD_ini_ruler_origin; } catch( error ) {};
	};// if
	// восстанавливаем единицы для обводки
	try 
	{ 
		if( AD.viewPreferences.strokeMeasurementUnits != AD_ini_str_units )
		{
			AD.viewPreferences.strokeMeasurementUnits = AD_ini_str_units;
		};// if
	} catch( error ) {};
	return; 
}// end RESTORE_INI_DOC_SETTINGS
//
// подпрограмма определения текстовых значений единиц для линеек документа
function GET_RULER_UNITS_TEXT( the_units ) 
{
	for( var i = 0; i < UN_LIST.length; i++ )
	{
		if( the_units == UN_LIST[i][0] ) return UN_LIST[i][1];
	};// for
	return "??";
};// end GET_RULER_UNITS_TEXT;
//
// подпрограмма чтения/записи в файл данных
// WRITE = true запись
// WRITE = false чтение
function INI_FILE_IO( WRITE )
{
	// ссылка на файл с настройками
	var INI_FILE;
	// существует ли файл с настройками
	var INI_EXISTS = false;
	// ошибки при обращении к файлу с настройками
	var INI_ERR = false;
	// строковый тип
	var STR_TYPE = "string";
	// логический тип
	var BOOL_TYPE = "boolean";
	// целый тип
	var INT_TYPE = "integer";
	//
	// подпрограмма открытия файла с настройками
	function INI_OPEN()
	{
		// существует ли файл с настройками
		INI_EXISTS = false;
		// ошибки при обращении к файлу с настройками
		INI_ERR = false;
		try
		{
			// получаем ссылку на файл данных с настройками используя 
			// путь к папке с активным скриптом и название активного скрипта
			INI_FILE = File( app.activeScript.path + "/"+ the_title +".ini" );
			// существует ли файл данных с настройками
			INI_EXISTS = INI_FILE.exists;
		}
		// если была ошибка при обращении к файлу с настройками
		catch( error )
		{
			INI_ERR = true;
		};// try-catch
		// если НЕТ ошибок при обращении к файлу данных
		if( !INI_ERR )
		{
			try
			{
				// если WRITE истина (запись)
				if( WRITE )
				{
					// открываем файл с настройками на запись
					INI_FILE.open( "w" );
				}
				// если WRITE ложь (чтение)
				else
				{
					// если существует файл с настройками
					if( INI_EXISTS )
					{
						// открываем файл с настройками на чтение
						INI_FILE.open( "r" );
					};// if
				};// if-else
			}
			// если была ошибка при обращении к файлу с настройками
			catch( error )
			{
				INI_ERR = true;
			};// try-catch
			// если WRITE истина (запись)
			if( WRITE )
			{
				// проверяем еще раз на всякий случай :)))
				// существует ли файл данных с настройками
				try
				{
					INI_EXISTS = INI_FILE.exists;
				}
				catch( error )
				{
					INI_ERR = true;
				};// try-catch
			};// if
		};// if
		return;
	};// end INI_OPEN
	//
	// подпрограмма закрытия файла с настройками
	function INI_CLOSE()
	{
		// если файл с настройками существует
		if( INI_EXISTS )
		{
			try
			{
				// закрываем файл данных с настройками
				INI_FILE.close();
			}
			// если была ошибка при обращении к файлу с настройками
			catch( error )
			{
				INI_ERR = true;
			};// try-catch
		};// if
		return;
	};// end INI_CLOSE
	//
	// подпрограмма чтения/записи из/в файл/переменные окружения
	// VAR_NAME - имя переменной как строка
	// VAL - значение переменной
	// TYPE - тип переменной
	// DEF - значение по умолчанию (если ошибка чтения/записи)
	function VAR_RW( VAR_NAME, VAL, TYPE, DEF )
	{
		// ВНИМАНИЕ!
		// переменные окружения сохраняют свои значения 
		// только до перезапуска приложения InDesign! 
		// для постоянного хранения данных они НЕ пригодны!
		//
		// текстовое значение имени для переменной окружения
		var ENV_NAME = the_title + "_" + VAR_NAME;
		// ошибка при обработке значения
		var VAR_ERR = false;
		//
		// подпрограмма преобразования переменной для чтения/записи
		// V - переменная
		function VAL_CONV( V  )
		{
			// подпрограмма преобразования типа переменной
			function TYPE_CONV()
			{
				// преобразованное значение
				var CONV_VAL = undefined;
				// преобразуем значения переменной V
				// строковый тип "string"
				// оставляем как было :)))
				if( TYPE == STR_TYPE ) CONV_VAL = V;
				// целый тип "integer"
				// при записи преобразуем целое значение в строковое 
				// при чтении преобразуем строковое значение в целое
				if( TYPE == INT_TYPE ) CONV_VAL = ( WRITE ) ? ( V.toString() ) : ( parseInt( V ) );
				// логический тип "boolean"
				// при записи преобразуем логические true или false в строковые "1" или "0"
				// при чтении преобразуем строковые "1" или "0" в логические true или false
				if( TYPE == BOOL_TYPE ) CONV_VAL = ( WRITE ) ? ( Number( V ).toString() ) : ( Boolean( parseInt( V ) ) );
				// проверка переменной при чтении
				if( !WRITE )
				{
					// проверяем возможность преобразовать строку в число
					var READ_VAR = STR_FOR_NUM( V );
					// если невозможно преобразовать строку в число тогда ошибка
					if( (READ_VAR === false) || (READ_VAR === "") || isNaN( READ_VAR ) ) VAR_ERR = true;
				};// if
				return CONV_VAL;
			};// end TYPE_CONV
			//
			try
			{
				// преобразуем значение
				V = TYPE_CONV();
			} 
			catch( error ) 
			{
				// если ошибка чтения/записи
				VAR_ERR = true;
			};// try-catch
			// возвращаем значение
			return V;
		};// end VAL_CONV
		//
		// подпрограмма записи переменной окружения
		function SET_ENV()
		{
			try
			{
				// записываем значение в переменную окружения
				$.setenv( ENV_NAME, VAL_CONV( VAL ) );
			} 
			catch( error ) 
			{
				// если ошибка записи
				VAR_ERR = true;
			};// try-catch
			return;
		};// end SET_ENV
		//
		// если запись 
		if( WRITE )
		{
			// если файл с настройками НЕ существует
			if( !INI_EXISTS )
			{
				// записываем значение в переменную окружения
				SET_ENV();
			}
			// если файл с настройками существует
			else
			{
				try
				{
					// записываем значение как строку в файл
					INI_FILE.writeln( VAL_CONV( VAL ) );
				} 
				// если была ошибка
				catch( error ) 
				{
					// записываем значение в переменную окружения
					SET_ENV();
				};// try-catch
			};// if-else
		}
		// если чтение
		else
		{
			// если файл с настройками НЕ существует
			if( !INI_EXISTS )
			{
				try
				{
					// получаем значение из переменной окружения
					// если переменная окружения определена (НЕ null) тогда преобразуем значение
					// если переменная окружения НЕ определена (null) присваиваем значение по умолчанию
					VAL = ( $.getenv( ENV_NAME ) !== null ) ? VAL_CONV( $.getenv( ENV_NAME ) ) : DEF;
				}
				// если была ошибка
				catch( error )
				{
					VAR_ERR = true;
				};// try-catch
			}
			// если файл с настройками существует
			else
			{
				try
				{
					// читаем значение как строку из файла
					VAL = VAL_CONV( INI_FILE.readln() );
				}
				// если была ошибка
				catch( error )
				{
					VAR_ERR = true;
				};// try-catch
			};// if-else
			// если была ошибка при обработке значения на чтении
			if( VAR_ERR )
			{
				// присваиваем значение по умолчанию
				VAL = DEF;
			};// if
		};// if-else
		return VAL;
	};// end VAR_RW
	//
	// подпрограмма присвоения (чтения)  и записи начальных значений 
	function INI_RW()
	{
		// длина метки по вертикали (строка)
		LENGTH_VER_INI = VAR_RW( "LENGTH_VER_INI", LENGTH_VER_INI, STR_TYPE, "5" );// 1
		// длина метки по горизонтали (строка)
		LENGTH_HOR_INI = VAR_RW( "LENGTH_HOR_INI", LENGTH_HOR_INI, STR_TYPE, "5" );// 2
		// отступ метки по вертикали (строка)
		OFFSET_VER_INI = VAR_RW( "OFFSET_VER_INI", OFFSET_VER_INI, STR_TYPE, "2" );// 3
		// отступ метки по горизонтали (строка)
		OFFSET_HOR_INI = VAR_RW( "OFFSET_HOR_INI", OFFSET_HOR_INI, STR_TYPE, "2" );// 4
		// вылет объекта по вертикали (строка)
		BLEED_VER_INI = VAR_RW( "BLEED_VER_INI",  BLEED_VER_INI, STR_TYPE, "0" );// 5
		// вылет объекта по горизонтали (строка)
		BLEED_HOR_INI = VAR_RW( "BLEED_HOR_INI", BLEED_HOR_INI, STR_TYPE, "0" );// 6
		// числовое значение толщины линии (строка)
		SW_NUM_INI = VAR_RW( "SW_NUM_INI", SW_NUM_INI, STR_TYPE, "0.25" );// 7
		// единицы измерения для толщины линии (индекс, число)
		SW_UN_INI = VAR_RW( "SW_UN_INI", SW_UN_INI, INT_TYPE, 2 );// 8
		// построение белого контура (логическое значение)
		W_CONT_INI = VAR_RW( "W_CONT_INI", W_CONT_INI, BOOL_TYPE, false );// 9
		// границы объектов (индекс, число)
		BOUNDS_INI = VAR_RW( "BOUNDS_INI", BOUNDS_INI, INT_TYPE, 0 );// 10
		// группировка после построения меток (индекс, число)
		G_M_INI = VAR_RW( "G_M_INI", G_M_INI, INT_TYPE, 0 );// 11
		// запомнить направления (логическое значение)
		REM_DIR = VAR_RW( "REM_DIR", REM_DIR, BOOL_TYPE, true );// 12
		// направления 13-24
		for( var i = 0; i < N_dir_dial; i++ )
		{
			// логическое значение 
			DIR_INI[i] = VAR_RW( "DIR_INI["+i.toString()+"]", DIR_INI[i], BOOL_TYPE, false );
		};// for
		// ширина белого контура (строка)
		W_CONT_W_INI = VAR_RW( "W_CONT_W_INI", W_CONT_W_INI, STR_TYPE, "0.5" );// 25
		//
		// если чтение из файла с настройками
		// тогда дополнительная проверка диапазонов дропдаунов
		if( !WRITE )
		{
			// подпрограмма проверки диапазона начального значения для дропдауна
			function DROP_INI( ini, max, def )
			{
				// если начальный индекс не укладывается в заданный диапазон
				// тогда возвращаем значение "по умолчанию"
				if( ( ini < 0 ) || ( ini > max ) ) return def;
				return ini;
			};// end DROP_INI_CHECK
			//
			// границы 
			BOUNDS_INI = DROP_INI( BOUNDS_INI, 1, 0 );
			// единицы для линии
			SW_UN_INI = DROP_INI( SW_UN_INI, 3, 2 );
			// группировка
			G_M_INI = DROP_INI( G_M_INI, 2, 0 );
		};// if
		return;
	};// end INI_RW
	//
	// открываем файл с настройками
	INI_OPEN();
	// собственно чтение/запись настроек для выполнения скрипта
	INI_RW();
	// закрываем файл с настройками
	INI_CLOSE();
	return;
};// end INI_FILE_IO
//
// подпрограмма определения является ли значение меньше или равно 0
function LE_ZERO( x ) 
{
	try
	{
		if( x <= 0. ) return true;
	} catch( error ) {};
	return false;
};// end LE_ZERO
//
// подпрограмма проверки является ли текстовое значение нулевым
function CHECK_ZERO_TEXT( the_text )
{
	// переводим текстовое значение в числовое
	var VAL = parseFloat( TEXT_TO_DIGIT( the_text ) );
	// если текст преобразуется в ноль или в НЕчисло
	// тогда возвращаем "0" иначе оставляем текст как был
	return ( (VAL == 0.) || isNaN( VAL ) ) ? ZERO_TEXT : the_text;
};// end CHECK_ZERO_TEXT
//
// функция чтения текстового ввода и перевода в число
function TEXT_TO_DIGIT( txt ) 
{
	// получаем строку подготовленную для перевода в число
	var str = STR_FOR_NUM( txt );
	// если ошибка или пустая строка тогда 0
	if( ( str === false ) || ( str === "" ) ) str = ZERO_TEXT;
	// получаем числовое значение
	var digit = parseFloat( STR_FOR_NUM( str ) );
	// если ошибка тогда 0
	if( isNaN( digit ) ) digit = 0.;
	// возвращаем числовое значение
	return digit;
};// end TEXT_TO_DIGIT
//
// подпрограмма подготовки строки для перевода в число
function STR_FOR_NUM( S )
{
	// результирующая строка
	var S_OUT = "";
	// количество десятичных точек (запятых)
	var N_C = 0;
	// количество знаков плюс
	var N_P = 0;
	// количество знаков минус
	var N_M = 0;
	// цикл по символам во входной строке
	for( var i = 0; i < S.length; i++ ) 
	{
		// текущий символ
		var S_i = S[i];
		// заменяем запятую на точку
		if( S_i == "," ) S_i = ".";
		// проверяем если символ НЕ цифра, НЕ плюс, НЕ минус, НЕ точка тогда ошибка
		if( ("-+.0123456789").indexOf( S_i ) == -1 ) return false;
		// проверяем количество точек
		if( ( S_i == "." ) && ( ++N_C > 1 ) ) return false;
		// проверяем количество минусов и его позицию в строке
		if( ( S_i == "-" ) && ( ( ++N_M > 1 ) || ( i != 0 ) ) ) return false;
		// проверяем количество плюсов и его позицию в строке
		if( ( S_i == "+" ) && ( ( ++N_P > 1 ) || ( i != 0 ) ) ) return false;
		// формируем результирующую строку
		S_OUT = S_OUT + S_i;
	};// for i
	return S_OUT;
};// end STR_FOR_NUM
//
// функция чтения текстового ввода в активных единицах и перевода в пункты
// u - активные единицы измерения вида "хх"
// txt - исходное значение
function TEXT_AS_POINTS( txt, u ) 
{
	// переводим текст в нижний регистр (на всякий случай)
	var d = txt.toLowerCase();
	d = parseFloat( UnitValue( TEXT_TO_DIGIT( txt ), u ).as('pt') );
	// если не цифра, обнуляем
	if( isNaN( d ) ) 
	{
		d = 0.;
	};// if
	// возвращаем значение в пунктах
	return d;
};// end TEXT_AS_POINTS
//
// подпрограмма вычисления центра между координатами
function GET_CENTER( MIN, MAX )
{
	return ( MIN + ( MAX - MIN ) / 2. );
};// end GET_CENTER
//
// подпрограмма присвоения значения переменной
// в зависимости от файловой системы
// W - Windows
// M - Macintosh
function WM( W, M )
{
	return ( WFS ? W : M );
};// end WM
//
// подпрограмма присвоения значения переменной
// в зависимости от версии CS или CC
function CSCC( CS_VAL, CC_VAL )
{
	return ( CC ? CC_VAL : CS_VAL );
};// end CSCC
//
// подпрограмма окончания скрипта
function the_exit( txt )
{
	try
	{
		// восстанавливаем начальные настройки
		RESTORE_INI_DOC_SETTINGS();
	} catch( error ) {};// try-catch
	// если есть сообщение выводим его
	if( txt !="" ) alert( txt );
	// собственно окончание работы скрипта
	exit();
};// end the_exit