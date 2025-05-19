/*
Название: FitPageToSelection.jsx
Приложение для использования: Adobe InDesign CS3, CS4, CS5, CS6
Версия: 1.3.11
Язык реализации (Среда): JavaScript (ExtendScript Toolkit 2)
Операционные системы (Платформы): PC, Macintosh (Windows, Mac OS)
Условия распространения: Бесплатно; На Ваш риск
Назначение: Устанавливает размер страницы в документе в соответствии с размером выделения
Функциональные ограничения: Не работает с выделенными направляющими
Техническая поддержка: Sergey-Anosov@yandex.ru
https://sites.google.com/site/dtpscripting
===================================================
Name: FitPageToSelection.jsx
Application to use with: Adobe InDesign CS3, CS4, CS5, CS6
Version: 1.3.11
Program language (Environment): JavaScript (ExtendScript Toolkit 2)
Operating systems (Platforms): PC, Macintosh (Windows, Mac OS)
Distribution conditions: Freeware; At your own risk
Functions: Resizes pages of document according to size of selection 
Functional limitations: Can not process selection containing guides
Technical support: Sergey-Anosov@yandex.ru
https://sites.google.com/site/dtpscripting
*/
// описание глобальных переменных
//
// название скрипта
var the_title = "FitPageToSelection";
// версия скрипта
var the_version = "1.3.11";
// заголовок диалога
var DLG_TEXT = the_title + " v." + the_version; 
// активный документ
var AD;
// подсказка для имени активного документа
var AD_TIP = "Document: ";
// строка для имени активного документа
var AD_NAME = "";
// активный разворот
var AS;
// информация о развороте (порядковый номер или имя)
var SPREAD_INF_TEXT = "";
// количество страниц на активном развороте
var AS_NP;
// индекс первой страницы на активном развороте
var AS_P1_INDEX;
// активная страница
var AP;
// является ли активная страница мастером
var AP_IS_MASTER = false;
// индекс для активной страницы в диапазоне страниц (обычные или мастера)
var AP_INDEX;
// размеры активной страницы
var AP_W;// ширина
var AP_H;// высота
// сохранить документ
var SAVE = false;
// подсказка для сохранения документа
var SAVE_TIP = "Save the document before operation";
// выделение в активном документе
var the_sel;
// количество объектов в выделении
var N_sel;
// массив информации об объектах в выделении
var SEL_INFO = new Array();
// проверено ли выделение
var SEL_CHECKED = false;
// текстовая строка для количества объектов в выделении
var SEL_TEXT = "Objects selected: ";
// подсказка для выделения в диалоге
var SEL_TIP = "Selection";
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
// начальные настройки отсчета координат
var AD_ini_ruler_origin;
// настройки координат = разворот
var RULERS_SPREAD = false;
// начальное положение начала координат
var AD_ini_zero;
// радиокнопка геометрические границы
var GEO_RB;
// подсказка для геометрических границ
var GEO_TIP = "Geometric";
// радиокнопка визуальные границы
var VIS_RB;
// подсказка для визуальных границ
var VIS_TIP = "Visible";
// индекс для выбора границ объектов
var BOUNDS_INDEX = 0;
// массив смещений
var SHIFTS_VAL = new Array( N_dir );
// подсказка для смещений
var SHIFTS_TIP = "Shifts";
// текстовые значения для подсказок направлений
var DIR_TEXT = 
[
	"Top", // (0) верх
	"Left", // (1) лево
	"Bottom", // (2) низ
	"Right" // (3) право
];
// индекс активного поля ввода смещения
var ACT_INDEX = 0;
// размер страницы из настроек документа
var DOC_PW;// ширина
var DOC_PH;// высота
// единицы измерения в документе
var H_UNITS;// по горизонтали (для ширины)
var V_UNITS;// по вертикали (для высоты)
// текст для единиц измерения
var H_UNITS_TEXT;// по горизонтали (для ширины)
var V_UNITS_TEXT;// по вертикали (для высоты)
// массив значений единиц измерений
var UN_LIST =
[
	[ 2054188905, "pt" ], // 0 points
	[ 2054187363, "pc" ], // 1 picas
	[ 2053729891, "in" ], // 2 inches
	[ 2053729892, "ind" ], // 3 inches decimal
	[ 2053991795, "mm" ], // 4 millimeters
	[ 2053336435, "cm" ], // 5 centimeters
	[ 2053335395, "ci" ], // 6 ciceros
	[ 2051106676, "ag"], // 7 agates
	[ 2054187384, "px" ], // 8 pixels
	[ 1131639917, "cu." ] // 9 custom
];
// центрирование после операции
var CENTER_AFTER;
// подсказка для центрирования после операции
var CENTER_AFTER_TIP = "Center selected objects on active page";
// учет смещений при центрировании
var CONS_SHIFTS;
// подсказка для учета смещений при центрировании
var CONS_SHIFTS_TIP = "Consider shifts for centering";
// подсказка для ширины
var W_TIP = "Width";
// подсказка для высоты
var H_TIP = "Height";
// старые размеры страницы
var OLD_W;// ширина
var OLD_H;// высота
// подсказка для старых размеров страницы
var OLD_TIP = "Old page size:";
// новые размеры страницы
var NEW_W;// ширина
var NEW_H;// высота
// подсказка для новых размеров страницы
var NEW_TIP = "New page size:";
// новые размеры страницы в пунктах
var NEW_W_PT;// ширина
var NEW_H_PT;// высота
// статический текст для новых размеров страницы
var NEW_W_ST;// ширина
var NEW_H_ST;// ширина
// чекбокс для симметричных сдвигов
var SYM_SHIFT_CB;
// значение чекбокса для симметричных сдвигов
var SYM_SHIFT_VAL = false;
// выполнялась ли операция
var DONE = false;
// результат операции
var DONE_OK = true;
// результат ввода числа
var exit_if_bad_input = false;
// выход если непригодное выделение
var exit_if_bad_sel = false;
// версия приложения InDesign
// 3=CS; 4=CS2; 5=CS3; 6=CS4; 7=CS5; 8 = CS6; 9 = CC
var APP_VERSION = parseInt( app.version );
// версия приложения InDesign CS5 или новее
var VERSION_GE_CS5 = ( APP_VERSION > 6 );
// версия приложения InDesign СС
var CC = ( APP_VERSION >= 9 );
// файловая система Windows
var WFS = ( File.fs == "Windows" );
// версия CS3 для Windows
var CS3_WIN = ( ( APP_VERSION == 5 ) && WFS );
// версия CS3 для Макинтош
var CS3_MAC = ( ( APP_VERSION == 5 )  && !WFS );
// ошибка при перемещении
var MOVE_ERR = false;
// поля устанавливались в ноль
var MARG_ZERO = false;
// массив для сохранения полей и колонок обычных страниц
var PAGE_M_C = new Array();
// массив для сохранения полей и колонок обычных страниц
var M_PAGE_M_C = new Array();
// изменялся ли размер страницы
var PAGE_SIZE_CHANGED = false;
// диапазон операции
var RANGE;
// подсказка для диапазона операции
var RANGE_TIP = "Range:";
// список для выбора диапазона операции
var RANGE_LIST = new Array();
// индекс диапазона операции документ полностью 
// с мастер-разворотами
var RANGE_AD = 0;
// индекс диапазона операции обычные страницы документа 
// (без мастер-разворотов)
var RANGE_ALL_PAGES = -1;
// индекс диапазона операции активная страница
var RANGE_AP = -1;
// индекс диапазона операции активный разворот
var RANGE_AS = -1;
// центр трансформации для страницы
var ANCOR;
// подсказка для центра трансформации для страницы
var ANCOR_TIP = "Anchor:";
// начальное значение для центра трансформации
var ANCOR_INI = 3;
// список опций для выбора центра трансформации
var ANCOR_LIST =
[
	"Bottom center",// 0
	"Bottom left",// 1
	"Bottom right",// 2
	"Center",// 3
	"Left center",// 4
	"Right center",// 5
	"Top center",// 6
	"Top left",// 7
	"Top right"// 8
];
// список опций для выбора центра трансформации
var ANCOR_LIST_NUM =
[
	1095656035, // (0) AnchorPoint.BOTTOM_CENTER_ANCHOR
	1095656044, // (1) AnchorPoint.BOTTOM_LEFT_ANCHOR
	1095656050, // (2) AnchorPoint.BOTTOM_RIGHT_ANCHOR
	1095656308, // (3) AnchorPoint.CENTER_ANCHOR
	1095658595, // (4) AnchorPoint.LEFT_CENTER_ANCHOR
	1095660131, // (5) AnchorPoint.RIGHT_CENTER_ANCHOR
	1095660643, // (6) AnchorPoint.TOP_CENTER_ANCHOR
	1095660652, // (7) AnchorPoint.TOP_LEFT_ANCHOR
	1095660658 // (8) AnchorPoint.TOP_RIGHT_ANCHOR
];
// число десятичных знаков на выводе диалога
var AFTER_DOT_X = 3;
var AFTER_DOT_Y = 3;
// текстовое значение нуля
var ZERO_TEXT = "0";
// заголовок предупреждения
var WARN_HEAD = "Warning!\n\n";
// выделение Белой стрелкой
var WHITE_POINTER = false;
//
// вызов основной подпрограммы
main();
//
// описание подпрограмм
//
// основная подпрограмма
function main()
{
	// проверяем есть ли открытые документы
	CHECK_DOC();
	// сохраняем старые настройки документа
	SAVE_SETTINGS();
	// проверяем выделение
	CHECK_SELECTION();
	// выводим диалог
	DIALOG();
	// собственно выполнение операции
	RESIZE();
	// завершение работы скрипта
	the_exit("");
};// end main
//
// подпрограмма вывода диалога
function DIALOG() 
{
	// подпрограмма назначения ширины в пикселах
	// для контрола или объекта в диалоге
	function DCW( d, w )
	{
		d.minimumSize.width =
		d.maximumSize.width = w;
		return;
	};// end DCW
	//
	// подпрограмма создания дропдауна
	function DROP( where, data_arr, data_ini, dd_len )
	{
		// создаем дропдаун
		var dr = where.add('dropdownlist');
		for( var i = 0; i < data_arr.length; i++ )
		{
			dr.add( 'item', data_arr[i] );
		};// for
		DCW( dr, dd_len );
		dr.selection = data_ini;
		return dr;
	};// end DROP
	//
	// подпрограмма создания текстовой строки
	function TEXT( where, text, len )
	{
		var t = where.add('statictext');
		if( len !== false ) DCW( t, len );
		t.text = text;
		return t;
	};// end TEXT
	//
	// подпрограмма создания группы
	function GROUP( where, col_row, align )
	{
		var GC = where.add('group');
		GC.orientation = col_row;
		GC.alignChildren = align;
		return GC;
	};// end GROUP_COL
	//
	// подпрограмма позиционирования объекта
	function OBJ_XY( where, obj_type, x, y, h, w, obj_text, obj_val ) 
	{
		var the_obj = where.add(obj_type);
		the_obj.bounds = [x, y, x+w, y+h];
		// если чекбокс, текст, редактируемый текст, кнопка 
		if (
			obj_type == 'checkbox' ||
			obj_type == 'statictext' ||
			obj_type == 'edittext' ||
			obj_type ==  'button'
		)
		{
			// добавляем текст
			the_obj.text = obj_text;
		};// if
		// если радиокнопка или чекбокс 
		if ( 
			obj_type == 'radiobutton' ||
			obj_type == 'checkbox' 
		)
		{
			// присваиваем состояние
			the_obj.value = obj_val;
		};// if
		return the_obj;
	};// end OBJ_XY
	//
	// подпрограмма создания чекбокса
	function CB( where, text, ini )
	{
		var C = where.add('checkbox');
		C.text = text;
		C.value = ini;
		return C;
	};// end CB
	//
	// подпрограмма вывода числа в диалоге
	// с переводом его в текст и с учетом десятичных знаков
	// N - число
	// HOR = true - значение для горизонтали, false - значение для вертикали
	function STR_DIAL( N, HOR )
	{
		// получаем число десятичных знаков
		var AFTER_DOT = HOR ? AFTER_DOT_X : AFTER_DOT_Y;
		// возвращаем текстовое значение
		return ( ( (N).toFixed( AFTER_DOT ) ).toString() );
	};// end STR_DIAL
	//
	// размеры главной панели с размерами
	var mp_left = 8;
	var mp_top = 20;
	var mp_right = 300;
	var mp_bottom = WM( CSCC( 180, 173 ), 180 );
	// создание окна диалога
	var dlg = new Window('dialog');
	// верхняя группа для опций
	var top_group = GROUP( dlg, 'column', 'left' );
	// ширина верхней группы
	var top_group_len = WM( CSCC( 290, 290 ), 300 );
	DCW( top_group, top_group_len );
	// ширина текстовых объектов в верхней группе
	var tg_text_len = top_group_len - WM( 2, 5 );
	// заголовок диалога
	dlg.text = DLG_TEXT; 
	// имя документа
	TEXT( top_group, ( AD_TIP + AD_NAME ), tg_text_len );
	// запрос на сохранение если документ не сохранен
	var SAVE_CB = CB( top_group, SAVE_TIP, false );
	//
	// формируем информацию о странице
	var PAGE_INF_TEXT = unescape( AP.name );
	PAGE_INF_TEXT = PAGE_INF_TEXT + " (#"+( AP.index + 1 ).toString()+" of " + ( AS_NP ).toString() + " on spread";
	PAGE_INF_TEXT = "Active page: " + PAGE_INF_TEXT;
	//
	// объединяем информацию о странице и ее развороте
	var PAGE_SPREAD_INF_TEXT = PAGE_INF_TEXT + " " + SPREAD_INF_TEXT + ")";
	// создаем статический текст в диалоге для информации о странице и развороте
	TEXT( top_group, PAGE_SPREAD_INF_TEXT, tg_text_len );
	// 
	// если версия CS5 и выше
	// тогда создаем дропдауны для выбора диапазона и центра трансформации
	if( VERSION_GE_CS5 )
	{
		// создаем "строку" в диалоге для выбора диапазона и центра трансформации
		var RANGE_LINE = GROUP( top_group, 'row', 'left' );
		// получаем опции диалога для диапазона операции
		GET_RANGE_OPTIONS();
		// выбор диапазона для изменения размеров страниц
		TEXT( RANGE_LINE, RANGE_TIP, false );
		// создаем дропдаун для выбора диапазона
		var RANGE_DROP = DROP( RANGE_LINE, RANGE_LIST, RANGE_AP, 90 );
		RANGE_DROP.onChange = RANGE_onChange;
		// выбор центра трансформации
		TEXT( RANGE_LINE, ANCOR_TIP, false );
		// создаем дропдаун для выбора центра трансформации
		var ANCOR_DROP = DROP( RANGE_LINE, ANCOR_LIST, ANCOR_INI, WM( CSCC( 87, 83 ), 90 ) );
	};// if
	// выводим количество выделенных объектов
	TEXT( top_group, SEL_TEXT, tg_text_len );
	// создаем чекбокс для центрирования выделения
	var CENTER_AFTER_CB = CB( top_group, CENTER_AFTER_TIP, true );
	// создаем чекбокс учета смещений при центрировании
	var CONS_SHIFTS_CB = CB( top_group, CONS_SHIFTS_TIP, false );
	CONS_SHIFTS_CB.enabled = false;
	// если было выделение белой стрелкой тогда деактивируем опции центрирования
	if( WHITE_POINTER )
	{
		CENTER_AFTER_CB.value = CONS_SHIFTS_CB.value = 
		CENTER_AFTER_CB.enabled = CONS_SHIFTS_CB.enabled = false;
	};// if
	// 
	// подпрограмма реакции на нажатие чекбокса центрирования выделения
	CENTER_AFTER_CB.onClick = function()
	{
		// если НЕ нажат чекбокс центрирования выделения 
		// тогда НЕ активен чекбокс учета смещений
		if( !CENTER_AFTER_CB.value ) CONS_SHIFTS_CB.enabled = CONS_SHIFTS_CB.value = false
		// если нажат чекбокс центрирования выделения 
		// тогда активен чекбокс учета смещений
		else CONS_SHIFTS_CB.enabled = true;
		// активация  / деактивация чекбокса учета смещений 
		// при центрировании выделения
		CONS_SHIFTS_ENABLE();
		return;
	};// end CENTER_AFTER_CB.onClick
	//
	// главная панель для выбора границ и вывода размеров в окне диалога
	var mp = dlg.add('panel');
	mp.text = "Bounds";
	mp.bounds = [ mp_left, mp_top, mp_right, mp_bottom ];
	// колонка 1
	var col_1_h = 25;
	var col_1_w = 70;
	var col_1_dy = 25;
	var col_1_x0 = mp_left;
	var col_1_y0 = mp_top - (( CC && WFS ) ? 6 : 0);
	// 1 строка "Выделение"
	OBJ_XY(mp, 'statictext', col_1_x0, col_1_y0, col_1_h, col_1_w, ( SEL_TIP + ":" ), false);
	// 2 строка "Геометрические границы"
	OBJ_XY(mp, 'statictext', col_1_x0, col_1_y0+col_1_dy, col_1_h, col_1_w, GEO_TIP, false);
	// 3 строка "Визуальные границы"
	OBJ_XY(mp, 'statictext', col_1_x0, col_1_y0+col_1_dy*2, col_1_h, col_1_w, VIS_TIP, false);
	// 4 строка "Старый размер страницы"
	OBJ_XY(mp, 'statictext', col_1_x0, col_1_y0+col_1_dy*3, col_1_h, col_1_w+25, OLD_TIP, false);
	// 5 строка "Новый размер страницы"
	OBJ_XY(mp, 'statictext', col_1_x0, col_1_y0+col_1_dy*4, col_1_h, col_1_w+25, NEW_TIP, false);
	// колонка 2 (радиокнопки)
	var col_2_x0 = col_1_x0 + col_1_w + WM( CSCC( 3, -7 ), 3 );
	var col_2_y0 = col_1_y0 + WM( CSCC( 8, 19 ), 8 );
	var col_2_h = 25;
	var col_2_w = 40;
	var RB_GROUP = mp.add('group');
	RB_GROUP.bounds = [col_2_x0, col_2_y0, col_2_x0+col_2_h, col_2_y0+col_2_h*3];
	// радиокнопка для геометрических границ
	GEO_RB = OBJ_XY( RB_GROUP, 'radiobutton', 5, 12,  28,  35, "", true );
	GEO_RB.onClick = SHOW_NEW_W_H;
	// радиокнопка для визуальных границ
	VIS_RB = OBJ_XY( RB_GROUP, 'radiobutton', 5, 12+col_2_h,  28,  35, "", false );
	VIS_RB.onClick = SHOW_NEW_W_H;
	//колонка 3 ШИРИНА
	var col_3_h = col_2_h;
	var col_3_w = 80;
	var col_3_dy = 20;
	var col_3_x0 = col_2_x0+col_2_w - 5;
	var col_3_y0 = col_1_y0;
	// ширина выделения (геометрические размеры)
	var sel_w_g =  GET_W_H( SEL_SIZE[ 0 ], true );
	// ширина выделения (визуальные размеры)
	var sel_w_v = GET_W_H( SEL_SIZE[ 1 ], true );
	// выводим наименование колонки - ШИРИНА
	OBJ_XY(mp, 'statictext', col_3_x0, col_3_y0, col_3_h, col_3_w, ( W_TIP +" (" + H_UNITS_TEXT + ")" ), false );
	// положение второй строки
	var line_2_y = col_3_y0 + (( CC && WFS ) ? 3 : 0);
	// выводим ширину выделения (геометрические размеры)
	OBJ_XY(mp, 'statictext', col_3_x0, line_2_y+col_3_dy+5, 20, col_3_w, STR_DIAL( sel_w_g, true ), false );
	// выводим ширину выделения (визуальные размеры)
	OBJ_XY(mp, 'statictext', col_3_x0, line_2_y+col_3_dy*2+10, 20, col_3_w, STR_DIAL( sel_w_v, true ), false );
	// получаем текстовое значение для старой ширины страницы
	// если версия CS5 и новее тогда сначала выводим ширину активной страницы
	// если версия CS4 и старше тогда сначала выводим ширину страницы из настроек документа
	OLD_W = STR_DIAL( ( VERSION_GE_CS5 ? AP_W : DOC_PW ), true );
	// создаем статический текст для вывода старой ширины страницы
	var OLD_W_ST = OBJ_XY(mp, 'statictext', col_3_x0, line_2_y+col_3_dy*3+15, 20, col_3_w, OLD_W, false );
	// создаем статический текст для вывода новой ширины страницы
	NEW_W_ST = OBJ_XY(mp, 'statictext', col_3_x0, line_2_y+col_3_dy*4+20, 20, col_3_w, "", false );
	// колонка 4 ВЫСОТА
	var col_4_h = col_3_h;
	var col_4_w = col_3_w;
	var col_4_dy = col_3_dy;
	var col_4_x0 = col_3_x0+col_3_w + 10;
	var col_4_y0 = col_3_y0;
	// высота выделения (геометрические размеры)
	var sel_h_g = GET_W_H( SEL_SIZE[ 0 ], false );
	// высота выделения (визуальные размеры)
	var sel_h_v = GET_W_H( SEL_SIZE[ 1 ], false );
	// выводим наименование колонки - ВЫСОТА
	OBJ_XY(mp, 'statictext', col_4_x0, col_4_y0, col_4_h, col_4_w, ( H_TIP + " (" +V_UNITS_TEXT+ ")" ), false );
	// выводим высоту выделения (геометрические размеры)
	OBJ_XY(mp, 'statictext', col_4_x0, line_2_y+col_4_dy+5, 20, col_4_w, STR_DIAL( sel_h_g, false ), false );
	// выводим высоту выделения (визуальные размеры)
	OBJ_XY(mp, 'statictext', col_4_x0, line_2_y+col_4_dy*2+10, 20, col_3_w, STR_DIAL( sel_h_v, false ), false );
	// получаем текстовое значение для старой высоты страницы
	// если версия CS5 и новее тогда сначала выводим высоту активной страницы
	// если версия CS4 и старше тогда сначала выводим высоту страницы из настроек документа
	OLD_H = STR_DIAL( ( VERSION_GE_CS5 ? AP_H : DOC_PH ), false );
	// создаем статический текст для вывода старой высоты страницы
	var OLD_H_ST = OBJ_XY(mp, 'statictext', col_4_x0, line_2_y+col_4_dy*3+15, 20, col_3_w, OLD_H, false );
	// создаем статический текст для вывода новой высоты страницы
	NEW_H_ST = OBJ_XY(mp, 'statictext', col_4_x0, line_2_y+col_4_dy*4+20, 20, col_3_w, "", false );
	//
	// подпрограмма реакции на изменение диапазона
	function RANGE_onChange()
	{
		// выбранный индекс в дропдауне диапазона
		var R = RANGE_DROP.selection.index;
		// если диапазон активная страница тогда выводим в диалоге размер активной страницы
		// в остальных случаях выводим размер страницы заданный в настройках документа
		OLD_W_ST.text = STR_DIAL( ( ( R == RANGE_AP ) ? AP_W : DOC_PW ), true );// ширина
		OLD_H_ST.text = STR_DIAL( ( ( R == RANGE_AP ) ? AP_H : DOC_PH ) , false );// высота
		return;
	};// end RANGE_onChange
	//
	// панель для ввода отступов
	var S_pan = dlg.add('panel');
	S_pan.text = SHIFTS_TIP;
	// массив полей ввода смещений
	var SHIFTS = new Array( N_dir );
	//
	// подпрограмма обработки поля ввода в процессе
	function digit_on_Changing( et, def, emp ) 
	// et - поле ввода
	// def - значение по умолчанию если ошибка ввода
	// emp - значение если пустое поле
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
			alert( "Bad number input!", DLG_TEXT );
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
	// обработка поля ввода по завершении
	function digit_on_Change( et ) 
	{
		// проверяем требуется ли присвоение "0" в поле ввода
		et.text = CHECK_ZERO_TEXT( et.text );
		return;
	};// end digit_on_Change
	//
	// подпрограмма активации  / деактивации чекбокса
	// учета смещений при центрировании выделения
	function CONS_SHIFTS_ENABLE()
	{
		if( !CENTER_AFTER_CB.value ) return;
		// цикл по полям ввода смещений
		for( var i = 0; i < N_dir; i++ )
		{
			// если в текущем поле ввода есть значение
			if( Math.abs( TEXT_TO_DIGIT( SHIFTS[i].text ) ) != 0 )
			{
				// активируем чекбокс учета смещений при центрировании
				if( !CONS_SHIFTS_CB.enabled ) CONS_SHIFTS_CB.enabled = true;
				return;
			};// if
		};// for
		// если НЕТ полей ввода со смещениями тогда деактивируем
		// чекбокс учета смещений при центрировании
		if( CONS_SHIFTS_CB.enabled ) CONS_SHIFTS_CB.value = CONS_SHIFTS_CB.enabled = false;
		return;
	};// end CONS_SHIFTS_ENABLE
	//
	// границы панели для ввода смещений
	var s_left = 8;
	var s_top = 20;
	var s_right = 300;
	var s_bottom = WM( CSCC( 170, 176 ), 173 );
	// собственно создаем панель для ввода смещений
	S_pan .bounds = [s_left, s_top, s_right, s_bottom];
	//
	// подпрограмма создания поля ввода для смещения
	function SHIFT_XY( the_index, x, y )
	{
		// текстовая подсказка для направления в диалоге
		var tip = DIR_TEXT[ the_index ];
		// текст для единиц измерения
		var ut = ( ( the_index == 1 ) || ( the_index == 3 ) ) ? H_UNITS_TEXT : V_UNITS_TEXT;
		// высота текстовых объектов
		var txt_h = 20;
		// дополнительное смещение по высоте
		var d_y = txt_h + 5;
		// положение по горизонтали текстового объекта
		var txt_y = ( the_index == 0 ) ? ( y - d_y ) : ( y + d_y );
		// выравнивание текста для подсказки для направления
		var just = ( the_index == 3 ) ? 'right' : 'left';
		// начальное положение X текста для подсказки для направления
		var txt_x = ( the_index == 3 ) ? ( x - WM( CSCC( 15, 18 ), ( (!CS3_MAC) ? 25 : 19) ) ) : x;
		// ширина текстовой подсказки для направления
		var tip_w = [ 62, WM( CSCC( 65, 65 ), 75 ), 90, WM( CSCC( 65, 70 ), 75 ) ];
		// создаем статический текст с подсказкой для направления
		var SH_DIR = OBJ_XY( S_pan, 'statictext', txt_x, txt_y, txt_h, tip_w[ the_index ], tip + " ("+ut+")", false );
		// присваиваем выравнивание текста подсказки
		SH_DIR.justify = just;
		// верхняя граница поля ввода для смещения (редактируемый текст)
		var inp_y = txt_y + d_y;
		// создаем поле ввода смещения
		var the_shift = OBJ_XY( S_pan, 'edittext', x, y, txt_h, 50, ZERO_TEXT, false );
		//
		// подпрограмма обработки смещения в процессе
		the_shift.onChanging = function()
		{
			// индекс активного поля ввода смещения
			ACT_INDEX = the_index;
			// обрабатываем поле ввода
			digit_on_Changing( the_shift, ZERO_TEXT, ZERO_TEXT );
			// если симметричный ввод
			if( SYM_SHIFT_VAL )
			{
				SYM_FIELDS();
			};// if
			// обновляем значения в диалоге
			SHOW_NEW_W_H();
			// активация  / деактивация чекбокса учета смещений 
			// при центрировании выделения
			CONS_SHIFTS_ENABLE();
			return;
		};// end the_shift.onChanging
		//
		// подпрограмма обработки смещения после завершения
		the_shift.onChange = function()
		{
			digit_on_Change( the_shift );
			// активация  / деактивация чекбокса учета смещений 
			// при центрировании выделения
			CONS_SHIFTS_ENABLE();
			return;
		};// end the_shift.onChange
		//
		// подпрограмма позиционирования плюса и минуса
		function PM( pm_xy )
		{
			// высота знака
			var sign_h = 15;
			// ширина знака 
			var sign_w = WM( CSCC( 10, 15 ), 15 );
			// создаем статический текст для первого знака
			OBJ_XY( S_pan, 'statictext', pm_xy[1], pm_xy[2], sign_h, sign_w, pm_xy[0][0], false );
			// создаем статический текст для второго знака
			OBJ_XY( S_pan, 'statictext', pm_xy[3], pm_xy[4], sign_h, sign_w, pm_xy[0][1], false );
			return;
		};// end PM
		//
		// массив координат для плюса или минуса в зависимости от направления
		switch( the_index )
		{
			// Верх
			case 0: 
				var P_Y = inp_y - 10;
				var PM_XY = [ "+-", ( x - 16 ), P_Y, ( x - 14 ), ( P_Y +  txt_h ) ];
			break;
			// Лево
			case 1:
				var P_M_Y = inp_y - 70;
				var PM_XY = [ "+-", x, P_M_Y, ( x + WM( CSCC( 46, 44 ), 43 ) ), P_M_Y ];
			break;
			// Низ 
			case 2:
				var M_Y = inp_y - WM( CSCC( 58, 59 ), 60 );
				var PM_XY = [ "-+", ( x - 14 ), M_Y, ( x - 16 ), ( M_Y + txt_h ) ];
			break;
			// Право
			case 3: 
				var P_M_Y = inp_y - 70;
				var PM_XY = [ "+-", ( x + 40 ), P_M_Y, x, P_M_Y ];
			break;
		};// switch
		// создаем статический текст для плюса и минуса
		PM( PM_XY );
		// возвращаем поле ввода
		return the_shift;
	}; //end SHIFT_XY
	//
	// собственно создаем поля ввода смещений
	//
	// лево (1)
	var left_x = 19;
	var left_right_y = 63;
	SHIFTS[1] = SHIFT_XY( 1, left_x, left_right_y );
	// право (3)
	var right_x = left_x + WM( 200, 200 ); 
	SHIFTS[3] = SHIFT_XY( 3, right_x, left_right_y );
	// верх (0)
	var top_bottom_x = left_x + 100;
	var top_y = 5;
	SHIFTS[0] = SHIFT_XY( 0, top_bottom_x, top_y + 25 );
	// низ (2)
	var bottom_y = 95;
	SHIFTS[2] = SHIFT_XY( 2, top_bottom_x, bottom_y );
	// создание кнопки обнуления сдвигов
	var CLEAR_SHIFTS = OBJ_XY( S_pan, 'button', top_bottom_x-25, left_right_y-WM( CSCC( 1, 1 ), 2 ), 22, 100, "Clear shifts", false );
	CLEAR_SHIFTS.onClick = CLEAR_SHIFTS_ON_CLICK;
	//
	// подпрограмма реакции на нажатие кнопки обнулить сдвиги
	function CLEAR_SHIFTS_ON_CLICK() 
	{
		// цикл по полям смещений присваиваем 0
		for( var i = 0; i < N_dir; i++ ) SHIFTS[i].text = ZERO_TEXT;
		// обновляем значения в диалоге
		SHOW_NEW_W_H();
		// активация  / деактивация чекбокса учета смещений 
		// при центрировании выделения
		CONS_SHIFTS_ENABLE();
		return;
	};// end CLEAR_SHIFTS_ON_CLICK
	// 
	// обновляем значения в диалоге
	SHOW_NEW_W_H();
	//
	// подпрограмма для вывода нового размера страницы в диалоге
	function SHOW_NEW_W_H() 
	{
		// получаем индекс границ
		// 0 = геометрические 1=визуальные
		BOUNDS_INDEX = Number( VIS_RB.value );
		// новая ширина страницы с учетом смещений
		NEW_W = GET_W_H( SEL_SIZE[ BOUNDS_INDEX ], true ) + 
		TEXT_TO_DIGIT( SHIFTS[1].text ) + TEXT_TO_DIGIT( SHIFTS[3].text );
		// новая ширина страницы в диалоге
		NEW_W_ST.text = STR_DIAL( NEW_W, true );
		// новая высота страницы с учетом смещений
		NEW_H = GET_W_H( SEL_SIZE[ BOUNDS_INDEX ], false ) + 
		TEXT_TO_DIGIT( SHIFTS[0].text ) + TEXT_TO_DIGIT( SHIFTS[2].text );
		// новая высота страницы в диалоге
		NEW_H_ST.text = STR_DIAL( NEW_H, false );
		return;
	};// end SHOW_NEW_W_H
	//
	// чекбокс для симметричных отступов
	SYM_SHIFT_CB = OBJ_XY( S_pan, 'checkbox', WM( left_x, left_x), WM(CSCC(120, 123), 120), 15, 90, "Symmetric", false );
	SYM_SHIFT_CB.onClick = SYM_ON_CLICK;
	//
	// подпрограмма реакции на нажатие чекбокса для симметричных сдвигов
	function SYM_ON_CLICK() 
	{
		// получаем значение чекбокса для симметричных сдвигов
		SYM_SHIFT_VAL = SYM_SHIFT_CB.value;
		// если включен симметричный сдвиг
		if( SYM_SHIFT_VAL )
		{
			// присваиваем поля ввода
			SYM_FIELDS();
			// обновляем значения в диалоге
			SHOW_NEW_W_H();
		};// if
		return;
	};// end SYM_ON_CLICK
	//
	// подпрограмма присвоения полей ввода
	// для смещений при симметричных смещениях
	function SYM_FIELDS()
	{
		// цикл по полям ввода
		for( var i = 0; i < N_dir; i++ ) 
		{
			// если активное поле пропускаем
			if( i == ACT_INDEX ) continue;
			// присваиваем значение активного поля
			SHIFTS[i].text = SHIFTS[ ACT_INDEX ].text;
		};// for
		return;
	};// end SYM_FIELDS
	//
	// подпрограмма контроля нового размера страницы
	function CHECK_NEW_PAGE_SIZE()
	{
		// коэффициент для учета разных значений "пункты на дюйм"
		var POINTS_INCH = AD.viewPreferences.pointsPerInch;
		//
		// подпрограмма получения значений в контрольных единицах
		// измерения - пунктах или дюймах
		// VAL - значение размера по вертикали или горизонтали
		// UN - активные единицы измерения по вертикали или горизонтали
		function GET_CONTROL_VAL( VAL, UN )
		{
			// получаем контрольные единицы измерения как число
			// пункты или дюймы в зависимости от версии InDesign
			// если версия CS5 и новее тогда пункты иначе дюймы
			var CTRL_UN = ( VERSION_GE_CS5 ) ? ( "pt" ) : ( "in" );
			// переприсваиваем активные единицы измерения в текст вида "хх"
			// они могут измениться :))
			var UN_TEXT = UN;
			// корректировка активных единиц измерения
			// если активные единицы = пики (пайки)
			// тогда значение размера переводим в дюймы и локально единицы измерения = дюймы
			// учитываем значение "пункты на дюйм"
			if( UN == "pc" ) VAL = new UnitValue( ( VAL / POINTS_INCH * 12. ), ( UN_TEXT = "in" ) );
			// если активные единицы = десятичные дюймы 
			// тогда считаем что это просто дюймы :)))
			if( UN == "ind" ) UN_TEXT = "in";
			// если активные единицы = цицеро
			// тогда значение размера переводим в миллиметры и локально единицы измерения = миллиметры
			if( UN == "ci" ) VAL = new UnitValue( ( VAL * 4.511278195485008 ), ( UN_TEXT = "mm" ) );
			// если активные единицы = агаты
			// тогда значение размера переводим в дюймы и локально единицы измерения = дюймы
			if( UN == "ag" ) VAL = new UnitValue( ( VAL / 14. ), ( UN_TEXT = "in" ) );
			// если активные единицы единицы = пункты или custom (считаем что это просто пункты)
			if( UN == "cu." ) UN_TEXT = "pt";
			// если активные единицы единицы = пункты или custom
			// тогда учитываем значение "пункты на дюйм"
			if( ( UN == "pt" ) || ( UN_TEXT == "pt" ) ) VAL = VAL * ( 72. / POINTS_INCH );
			// возвращаем значение в контрольных единицах
			return ( UnitValue( VAL, UN_TEXT ).as( CTRL_UN ) );
		};// end GET_CONTROL_VAL
		//
		// минимальное значение
		var MIN = 1.;
		try
		{
			// переводим размеры в единицы для проверки
			var w = GET_CONTROL_VAL( NEW_W, H_UNITS_TEXT );// ширина
			var h = GET_CONTROL_VAL( NEW_H, V_UNITS_TEXT );// высота
			if( ( w < MIN ) || ( h < MIN ) ) return false; 
			// если версия CS5 и новее используем полученные значения в ПУНКТАХ
			// для функции трансформации размеров страницы
			if( VERSION_GE_CS5 )
			{
				NEW_W_PT = w;// ширина
				NEW_H_PT = h;// высота
			};// if
		} catch ( error ) {};
		return true;
	};// end CHECK_NEW_PAGE_SIZE
	//
	// создание панели кнопок (кнопка ОК, кнопка Cancel)
	var okPanel = GROUP( dlg, 'row', 'center' );
	// кнопка ОК
	var okBtn = okPanel.add('button', undefined, 'OK');
	// кнопка Cancel
	var cancelBtn = okPanel.add('button',undefined, 'Cancel');
	// собственно показываем окно диалога
	var DIALOG_BUTTON = dlg.show();
	// если выбрана первая кнопка (ОК)
	if( DIALOG_BUTTON == 1 ) 
	{
		// получаем индекс вида границ
		BOUNDS_INDEX = Number( VIS_RB.value );
		// получаем значения смещений
		for( var i = 0; i < N_dir; i++ )
		{
			SHIFTS_VAL[i] = TEXT_TO_DIGIT( SHIFTS[i].text );
		};// for
		// сохранение файла перед операцией
		SAVE = SAVE_CB.value;
		// центрирование после операции
		CENTER_AFTER = CENTER_AFTER_CB.value;
		// учет смещений при центрировании
		CONS_SHIFTS = CONS_SHIFTS_CB.value;
		// строка с выбранными настройками если версия CS5 и выше
		var SET_GE_CS5_STR = "";
		// строка с предупреждением 
		var CONF_MSG = "";
		// если версия CS5 и выше
		if( VERSION_GE_CS5 )
		{
			// диапазон изменения размеров
			SET_GE_CS5_STR += RANGE_TIP + " " + RANGE_DROP.selection.text + "\n";
			RANGE = RANGE_DROP.selection.index;
			// центр трансформации
			SET_GE_CS5_STR += ANCOR_TIP + " " + ANCOR_DROP.selection.text + "\n";
			ANCOR = ANCOR_LIST_NUM[ ANCOR_DROP.selection.index ];
			// проверка если активная страница мастер но диапазон весь документ (кроме мастеров)
			if( AP_IS_MASTER && ( RANGE == RANGE_ALL_PAGES ) )
			{
				CONF_MSG +=
				WARN_HEAD +
				"Active page is on master-spread\n" +
				"but chosen range of operation is:\n" +
				RANGE_LIST[ RANGE ] + ".\n\n";
			};// if
		};// if
		// проверка минимального размера страницы
		if( !CHECK_NEW_PAGE_SIZE() )
		{
			// если в результате проверки размер страницы слишком маленький
			// тогда завершение работы скрипта
			the_exit( "New page size is too small!" );
		};// if
		// строка с выбранными настройками
		var ALL_SET_STR = "Settings confirmation\n\n" +
		// имя документа
		AD_TIP + "\n" +
		AD_NAME + "\n\n" +
		// сохранение документа перед операцией
		SAVE_TIP +": " + YN( SAVE ) + "\n" +
		// информация об активной странице и развороте
		PAGE_SPREAD_INF_TEXT + "\n" +
		// если версия CS5 и выше
		SET_GE_CS5_STR +
		// количество объектов в выделении
		SEL_TEXT+ "\n" +
		// центрирование после операции
		CENTER_AFTER_TIP + ": " + YN( CENTER_AFTER ) + "\n" +
		// учет смещений при центрировании
		CONS_SHIFTS_TIP + ": " + YN( CONS_SHIFTS ) + "\n\n" +
		// размеры выделения
		"Selection bounds: " +  ( ( VIS_RB.value ) ? ( VIS_TIP + " (consider objects stroke)" ) : GEO_TIP ) + "\n" +
		W_TIP + ": "+ STR_DIAL( ( VIS_RB.value ) ? sel_w_v : sel_w_g, true ) + " " + H_UNITS_TEXT + "  " +
		H_TIP + ": "+ STR_DIAL( ( VIS_RB.value ) ? sel_h_v : sel_h_g, false ) + " " + V_UNITS_TEXT + "\n\n" +
		// смещения
		SHIFTS_TIP + ": " + "\n" +
		// лево
		DIR_TEXT[ 1 ] + ": " + STR_DIAL( SHIFTS_VAL[ 1 ], true )+ " " + H_UNITS_TEXT + "  " +
		// право
		DIR_TEXT[ 3 ] + ": " + STR_DIAL( SHIFTS_VAL[ 3 ], true )+ " " + H_UNITS_TEXT + "\n" +
		// верх
		DIR_TEXT[ 0 ] + ": " + STR_DIAL( SHIFTS_VAL[ 0 ], false )+ " " + V_UNITS_TEXT + "  " +
		// низ
		DIR_TEXT[ 2 ] + ": " + STR_DIAL( SHIFTS_VAL[ 2 ], false )+ " " + V_UNITS_TEXT + "\n\n" +
		// Старый размер страницы
		OLD_TIP + "\n" +
		W_TIP + ": " + OLD_W + " " + H_UNITS_TEXT + "  " + 
		H_TIP + ": " + OLD_H + " " + V_UNITS_TEXT + "\n\n" +
		// Новый размер страницы
		NEW_TIP + "\n" +
		W_TIP + ": " + STR_DIAL( NEW_W, true ) + " " + H_UNITS_TEXT + "  " +
		H_TIP + ": "+ STR_DIAL( NEW_H, false ) + " " + V_UNITS_TEXT + "\n\n";
		// если есть предупреждение добавляем его
		if( CONF_MSG != "" ) ALL_SET_STR += CONF_MSG;
		ALL_SET_STR += "Start operation?";
		// если есть подтверждение настроек
		if( confirm( ALL_SET_STR, false, DLG_TEXT ) ) 
		{
			// тогда возврат из подпрограммы диалога
			// и начало выполнения операции
			return;
		};// if
	};// if DIALOG_BUTTON == 1
	// если выбрана вторая кнопка Cancel
	// или НЕ было подтверждения настроек после OK
	// тогда завершение работы скрипта
	the_exit("");
};// end DIALOG
//
// подпрограмма получения опций диалога для диапазона операции
function GET_RANGE_OPTIONS()
{
	// подпрограмма создания опции
	function MAKE_OPTION( option_text )
	{
		// добавляем текстовое значение
		RANGE_LIST.push( option_text );
		// возвращаем индекс опции
		return ( RANGE_LIST.length - 1 );
	};// end MAKE_OPTION
	//
	// диапазон операции документ полностью с мастер-разворотами
	RANGE_AD = MAKE_OPTION( "Document completely (including Master-spreads)" );
	// диапазон операции обычные страницы документа (без мастер-разворотов)
	if( AD.spreads.length > 1 )
	{
		RANGE_ALL_PAGES = MAKE_OPTION( "All pages in document (excluding Master-spreads)" );
	};// if
	// диапазон операции активный разворот
	if( AS_NP > 1 )
	{
		RANGE_AS = MAKE_OPTION( "Active spread" );
	};// if
	// диапазон операции активная страница
	RANGE_AP = MAKE_OPTION( "Active page" );
	return;
};// end GET_RANGE_OPTIONS
//
// подпрограмма получения размера с учетом смещений
// BOUNDS - массив границ
// HOR = true: ширина, HOR = false - высота
function GET_W_H( BOUNDS, HOR )
{
	var INDEX = ( HOR ) ? [ 3, 1 ] : [ 2, 0 ];
	return ( BOUNDS[ INDEX[ 0 ] ] - BOUNDS[ INDEX[ 1 ] ] );
};// end GET_W_H
//
// подпрограмма сохранения старых настроек измерения документа
function SAVE_RULERS()
{
	// если настройки координат НЕ разворот
	if( !RULERS_SPREAD )
	{
		// запоминаем настройки координат, потому что 
		// они будут временно установлены как РАЗВОРОТ
		AD_ini_ruler_origin = AD.viewPreferences.rulerOrigin;
	};// if
	// запоминаем положение начала координат
	AD_ini_zero = AD.zeroPoint;
	return;
};// end SAVE_RULERS
//
// подпрограмма восстановления старых настроек измерения документа
function RESTORE_RULERS()
{
	// если настройки координат НЕ разворот
	if( !RULERS_SPREAD )
	{
		// восстанавливаем настройки координат
		AD.viewPreferences.rulerOrigin = AD_ini_ruler_origin;
	};// if
	// восстанавливаем положение начала координат
	AD.zeroPoint = AD_ini_zero;
	return;
};// end RESTORE_RULERS
//
// подпрограмма установки настроек измерения документа в нулевые значения
function ZERO_RULERS()
{
	// если настройки координат НЕ разворот
	if( !RULERS_SPREAD )
	{
		// устанавливаем настройки координат как РАЗВОРОТ
		AD.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
	};// if
	// положение начала координат = 0
	AD.zeroPoint = [ 0., 0. ];
	return;
};// end ZERO_RULERS
//
// подпрограмма сохранения старых настроек
function SAVE_SETTINGS() 
{
	try 
	{ 
		// сохраняем старые настройки для измерения
		SAVE_RULERS();
		// устанавливаем настройки для измерения в нулевые значения
		ZERO_RULERS();
		//
		// подпрограмма для запоминания настроек полей
		// s - массив разворотов
		// M_C_ARR - массив размеров полей и количества колонок
		function SAVE_MARG( s, M_C_ARR )
		{
			try
			{
				// цикл по разворотам
				for( var k = 0; k < s.length; k++ )
				{
					// текущий разворот
					var s_k = s[ k ];
					// цикл по страницам разворота
					for( var i = 0; i < s_k.pages.length; i++ )
					{
						// текущая страница
						var P = s_k.pages[i];
						// получаем настройки полей и колонок для текущей страницы
						with( P.marginPreferences )
						{
							// запоминаем в массив размеры полей 
							// и количество колонок для текущей страницы
							M_C_ARR.push( [ top, left, bottom, right, columnCount ] );
						};// with
					};// for i
				};// for k
			} catch ( error ) {};// try-catch
			return;			
		};// end SAVE_MARG
		//
		// запоминаем настройки полей для обычных страниц
		SAVE_MARG( AD.spreads, PAGE_M_C );
		// запоминаем настройки полей для мастер-страниц
		SAVE_MARG( AD.masterSpreads, M_PAGE_M_C );
	} catch ( error ) { };// catch-try
	return;
}// end SAVE_SETTINGS
//
// подпрограмма восстановления старых настроек
function RESTORE_SETTINGS() 
{
	// если настройки координат НЕ разворот
	if( !RULERS_SPREAD )
	{
		// восстанавливаем настройки координат
		AD.viewPreferences.rulerOrigin = AD_ini_ruler_origin;
	};// if
	// если НЕ было операции восстанавливаем положение начала координат
	if( !DONE ) AD.zeroPoint = AD_ini_zero;
	//
	// подпрограмма для восстановления настроек полей страниц
	// s - массив разворотов
	// M_C_ARR - массив размеров полей и количества колонок
	// j_start - начальный индекс для массива M_C_ARR
	function RESTORE_MARG( s, M_C_ARR, j_start )
	{
		try
		{
			// счетчик для элементов массива
			var j = j_start;
			// цикл по разворотам
			for( var k = 0; k < s.length; k++ )
			{
				// текущий разворот
				var s_k = s[k];
				// цикл по страницам на текущем развороте
				for( var i = 0; i < s_k.pages.length; i++ )
				{
					// восстанавливаем поля на текущей странице
					RESTORE_MARG_PAGE( s_k.pages[i], M_C_ARR[j] );
					// увеличиваем счетчик для элементов массива
					j++;
				};// for i
			};// for k
		} catch ( error ) {};// try-catch
		return;			
	};// end RESTORE_MARG
	//
	// подпрограмма восстановления полей на странице
	// P - страница
	// M_C_ARR - массив полей и числа колонок для страницы
	function RESTORE_MARG_PAGE( P, M_C_ARR )
	{
		// восстанавливаем ли старые поля для страницы P
		var RESTORE = false;
		// если не было проблем при выполнении
		if( DONE_OK )
		{
			// ширина текущей страницы
			var P_W = GET_W_H( P.bounds, true );
			// высота текущей страницы
			var P_H = GET_W_H( P.bounds, false );
			//
			// подпрограмма проверки старых полей для нового размера страницы
			// HOR = true - поля по горизонтали (левое и правое)
			// HOR = false - поля по вертикали (верхнее и нижнее)
			function CHECK_MARGINS( HOR )
			{
				// массивы индексов для направлений
				var INDEX = HOR ? [ 0, 2 ] : [ 1, 3 ];
				// размер страницы (ширина или высота)
				var P_SIZE = HOR ? P_W : P_H;
				// массив полей страницы
				var M = [ M_C_ARR[ INDEX[0] ], M_C_ARR[ INDEX[1] ] ];
				// сумма двух полей
				var M_0_1 = M[0] + M[1];
				// результат проверки полей
				var CHECK = 
				// если поле НЕ больше размера страницы 
				// и сумма полей НЕ больше размера страницы 
				( ! ( ( M[0] >= P_SIZE ) || ( M_0_1 >= P_SIZE ) || ( M[1] >= P_SIZE ) ) );
				return CHECK;
			};// end CHECK_MARGINS
			//
			// если все поля в порядке 
			if( CHECK_MARGINS( true ) && CHECK_MARGINS( false ) )
			{
				// присваиваем старые значения
				RESTORE = true;
			};// if
		}
		// если были проблемы при выполнении
		else
		{
			// присваиваем старые значения без проверки
			RESTORE = true;
		};// if-else
		// если восстанавливаем поля
		if( RESTORE )
		{
			try
			{
				// присваиваем настройки полей и колонок для текущей страницы
				with( P.marginPreferences )
				{
					top = M_C_ARR[0];// верхнее поле
					left = M_C_ARR[1];// левое поле
					bottom = M_C_ARR[2];// нижнее поле
					right = M_C_ARR[3];// правое поле
					columnCount = M_C_ARR[4];// число колонок
				};// with
			} catch( error ){};// try-catch
		};// if
		return;
	};// end RESTORE_MARG_PAGE
	//
	// если было выполнение операции
	if( DONE )
	{
		// если меняли поля пытаемся восстановить
		if( MARG_ZERO )
		{
			// если версия CS4 или старше
			if( !VERSION_GE_CS5 )
			{
				// восстанавливаем поля и колонки для обычных разворотов
				RESTORE_MARG( AD.spreads, PAGE_M_C, 0 );
				// восстанавливаем поля и колонки для мастер-разворотов
				RESTORE_MARG( AD.masterSpreads, M_PAGE_M_C, 0 );
			}
			// если версия CS5 или новее
			else
			{
				// диапазон активная страница
				if( RANGE == RANGE_AP )
				{
					// массив полей и колонок для активной страницы
					// в зависимости это мастер-страница или обычная страница
					var AP_M_C = ( AP_IS_MASTER ) ? M_PAGE_M_C[ AP_INDEX ] : PAGE_M_C[ AP_INDEX ];
					// восстанавливаем поля и колонки для активной страницы
					RESTORE_MARG_PAGE( AP, AP_M_C );
				};// if
				// диапазон страницы документа кроме мастер-страниц
				if( RANGE == RANGE_ALL_PAGES )
				{
					// восстанавливаем поля и колонки для обычных разворотов
					RESTORE_MARG( AD.spreads, PAGE_M_C, 0 );
				};// if
				// диапазон весь документ включая мастер-развороты
				if( RANGE == RANGE_AD )
				{
					// восстанавливаем поля и колонки для обычных разворотов
					RESTORE_MARG( AD.spreads, PAGE_M_C, 0 );
					// восстанавливаем поля и колонки для мастер-разворотов
					RESTORE_MARG( AD.masterSpreads, M_PAGE_M_C, 0 );
				};// if
				// диапазон активный разворот
				if( RANGE == RANGE_AS )
				{
					// массив полей и колонок для активной страницы
					// в зависимости это мастер-страница или обычная страница
					RESTORE_MARG( [AS], ( ( AP_IS_MASTER ) ? M_PAGE_M_C : PAGE_M_C ), AS_P1_INDEX );
				};// if
			};// if-else
		};// if
	};// if
	return;
};// end RESTORE_SETTINGS
//
// подпрограмма изменения размера
function RESIZE() 
{
	// был ли документ сохранен
	var AD_saved = AD.saved;
	// результат сохранения
	var WAS_SAVED_OK = false;
	try 
	{
		// если дана команда из диалога на сохранение сохраняем
		if( SAVE ) 
		{
			// перед сохранением восстанавливаем старые настройки измерения
			RESTORE_RULERS();
			// сохраняем документ
			AD.save();
		};// if
		// если не было ошибки, считаем, что в диалоге был ОК
		WAS_SAVED_OK = true;
	} catch( error ) { };// try-catch
	// если дана команда из диалога на сохранение и не было успешного сохранения
	if( SAVE && !WAS_SAVED_OK ) 
	{
		// если нет подтверждения 
		if( !confirm( "The document was not saved!\n\nContinue anyway?", true, DLG_TEXT ) ) 
		{
			// тогда выход из скрипта
			the_exit("");
		}
		else
		// если дано подтверждение продолжения работы
		{
			// опять ставим в ноль настройки измерения
			ZERO_RULERS();
		};// if-else
	};// if
	// 
	// если файл только был создан и сохранен ПЕРВЫЙ раз
	if( WAS_SAVED_OK && !AD_saved ) 
	{
		// обновляем выделение потому что если документ был Untitled
		// то после сохранения в нем все по новому :)))
		CHECK_SELECTION();
	};// if
	//
	// подпрограмма центрирования
	function CENTER()
	{
		// получаем границы выделения потому что с новым размером страницы они как бы новые :)))
		SELECTION_DIM();
		// массив границ выделения с учетом вида границ
		var SEL_BOUNDS = SEL_SIZE[ BOUNDS_INDEX ];
		// если задан учет смещений при центрировании
		if( CONS_SHIFTS )
		{
			// цикл по направлениям
			for( var i = 0; i < N_dir; i++ )
			{
				// корректируем границу выделения с учетом смещения для текущего направления
				SEL_BOUNDS[i] += ( SHIFTS_VAL[i] * ( ( ( i == 0 ) || ( i == 1 ) ) ? (-1.) : (1.) ) );
			};// for
		};// if
		// центр выделения
		// по горизонтали
		var SEL_X = GET_CENTER( SEL_BOUNDS[1], SEL_BOUNDS[3] );
		// по вертикали
		var SEL_Y = GET_CENTER( SEL_BOUNDS[0], SEL_BOUNDS[2] );
		// получаем размер активной страницы
		GET_AP_W_H();
		// центр активной страницы
		// по горизонтали
		var AP_X =  GET_CENTER( AP.bounds[1], AP.bounds[3] );
		// по вертикали
		var AP_Y = GET_CENTER( AP.bounds[0], AP.bounds[2] );
		// шаг для перемещения объектов
		var dx = AP_X - SEL_X;// по горизонтали
		var dy = AP_Y - SEL_Y;// по вертикали
		// перемещение выделения в центр активной страницы
		// цикл по объектам в выделении
		for( var i = 0; i < N_sel; i++) 
		{
			// перемещаем текущей объект в выделении
			MOVE( the_sel[i], dx, dy );
		};// for
		return;
	};// end CENTER
	//
	// подпрограмма собственно изменения размера страниц в заданном диапазоне
	function NEW_PAGE_SIZE()
	{
		// подпрограмма изменения размера страницы
		// the_page - обрабатываемая страница
		function PAGE_RESIZE( the_page )
		{
			// собственно изменение размера страницы
			the_page.resize ( 
				CoordinateSpaces.INNER_COORDINATES, 
				ANCOR,
				ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
				// новые размеры в пунктах
				[ NEW_W_PT, NEW_H_PT ],
				true,
				false
			);
			return;
		};// end PAGE_RESIZE
		//
		// подпрограмма изменения размера массива страниц
		// arr - массив страниц
		function PAGE_ARR_RESIZE( arr )
		{
			// цикл по массиву страниц
			for( var i = 0; i < arr.length; i++ )
			{
				// изменяем размер текущей страницы в массиве
				PAGE_RESIZE( arr[i] );
			};// for
			return;
		};// end PAGE_ARR_RESIZE
		//
		// подпрограмма изменения размера страниц 
		// в настройка документа
		function DOC_RESIZE()
		{
			AD.documentPreferences.pageWidth = NEW_W;// ширина
			AD.documentPreferences.pageHeight = NEW_H;// высота
			return;
		};// end DOC_RESIZE
		//
		// считаем что операция выполнялась :)))
		DONE = true;
		//
		// если версия CS5 и выше
		if( VERSION_GE_CS5 )
		{
			// если меняется размер только активной страницы
			if( RANGE == RANGE_AP )
			{
				PAGE_RESIZE( AP )
			};// if
			// если меняется размер страниц во всем документе
			// (без мастер-разворотов)
			if( RANGE == RANGE_ALL_PAGES )
			{
				// меняем размер каждой страницы в документе
				PAGE_ARR_RESIZE( AD.pages );
			};// if
			// если меняется размер страниц во всем документе полностью
			// включая мастер-страницы
			if( RANGE == RANGE_AD )
			{
				// цикл по всем мастер-разворотам в активном документе
				for( var i = 0; i < AD.masterSpreads.length; i++ )
				{
					PAGE_ARR_RESIZE( AD.masterSpreads[i].pages );
				};// for
				// меняем размер каждой страницы в документе
				PAGE_ARR_RESIZE( AD.pages );
				// меняем размер страницы в настройках документа
				DOC_RESIZE();
			};// if
			// если меняется размер страниц только на активном развороте
			if( RANGE == RANGE_AS )
			{
				PAGE_ARR_RESIZE( AS.pages );
			};// if		
		}
		// если версия CS4 и ниже
		else
		{
			// меняем размер страницы в настройках документа
			DOC_RESIZE();
		};// if
		// считаем что размер страницы изменился
		PAGE_SIZE_CHANGED = true;
		return;		
	};// end NEW_PAGE_SIZE
	//
	// подпрограмма обнуления полей страницы документа
	// P - страница
	function ZERO_MARGINS_PAGE( P )
	{
		with( P.marginPreferences )
		{
			// обнуляем поля страницы
			top = bottom = left = right = 0.;
			// колонка только одна
			columnCount = 1;
		};// with
		return;
	};// end ZERO_MARGINS_PAGE
	//
	// подпрограмма обнуления полей страниц документа
	function ZERO_MARGINS()
	{
		// подпрограмма обнуления полей разворотов
		// s - массив разворотов
		function ZERO_MARGINS_SPREADS( s )
		{
			// цикл по массиву разворотов
			for( var k = 0; k < s.length; k++ )
			{
				// текущий разворот
				var s_k = s[k];
				// цикл по страницам разворота
				for( var i = 0; i < s_k.pages.length; i++ )
				{
					// обнуление полей на текущей странице
					ZERO_MARGINS_PAGE( s_k.pages[i] );
				};// for i
			};// for k
			return;
		};// end ZERO_MARGINS_SPREADS
		//
		// если версия CS4 и старше
		if( !VERSION_GE_CS5 )
		{
			// обнуляем поля во всем документе
			// обычные развороты
			ZERO_MARGINS_SPREADS( AD.spreads );
			// мастер-развороты
			ZERO_MARGINS_SPREADS( AD.masterSpreads );
		}
		// если версия CS5 и новее
		else
		{
			// если диапазон активная страница
			if( RANGE == RANGE_AP )
			{
				// обнуление полей на активной странице
				ZERO_MARGINS_PAGE( AP );
			};// if
			// если диапазон все страницы (без мастер-разворотов)
			if( RANGE == RANGE_ALL_PAGES )
			{
				// обнуляем поля на обычных разворотах
				ZERO_MARGINS_SPREADS( AD.spreads );
			};// if
			// если диапазон все страницы и мастер развороты
			if( RANGE == RANGE_AD )
			{
				// обнуляем поля на обычных разворотах
				ZERO_MARGINS_SPREADS( AD.spreads );
				// обнуляем поля на мастер-разворотах
				ZERO_MARGINS_SPREADS( AD.masterSpreads );
			};// if
			// если диапазон активный разворот
			if( RANGE == RANGE_AS )
			{
				// обнуляем поля на активном развороте
				ZERO_MARGINS_SPREADS( [AS] );
			};// if
		};// if-else
		return;
	};// end ZERO_MARGINS
	//
	try 
	{
		// блокируем выделение
		LOCK_SEL( true );
		try
		{
			// пытаемся изменить высоту и ширину страницы
			NEW_PAGE_SIZE();
		} 
		// если была ошибка считаем что надо уменьшить поля
		catch( error )
		{
			// было обнуление полей
			MARG_ZERO = true;
			// обнуляем поля
			ZERO_MARGINS();
			// еще раз пытаемся изменяем высоту и ширину страницы
			// с обнуленными полями
			NEW_PAGE_SIZE();
		};// try-catch
		// разблокируем выделение
		LOCK_SEL( false );
	} 
	// если все равно ошибка при изменении размеров страницы
	catch( error ) 
	{
		// выводим сообщение об ошибке
		alert( "Can not resize!", DLG_TEXT );
		// разблокируем выделение
		LOCK_SEL( false );
		// отмена центрирования выделения
		CENTER_AFTER = false;
		// была ошибка при выполнении операции
		DONE_OK = false;
	};// try - catch
	// центрируем выделение если было задано
	if( CENTER_AFTER ) CENTER();
	return;
};// end RESIZE
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
// подпрограмма вычисления размеров выделения
// для обычных объектов
function SELECTION_DIM() 
{
	// определяем размерности массивов для перемещаемых объектов
	// границы текущего перемещаемого объекта
	// 0 = геометрические границы, 1 = визуальные границы >= размерность 2
	OBJ_SIZE = new Array( Array( N_sel ), Array( N_sel ) );
	// габариты всего выделения для перемещаемых объектов
	// 0 = геометрические границы, 1 = визуальные границы >= размерность 2
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
// подпрограмма получения размеров страницы из настроек документа
function PAGE_SIZE_DOC_PREF()
{
	DOC_PW = AD.documentPreferences.pageWidth;// ширина
	DOC_PH = AD.documentPreferences.pageHeight;// высота
	return;
};// end PAGE_SIZE_DOC_PREF
//
// подпрограмма получения размеров активной страницы
function GET_AP_W_H()
{
	AP_W = GET_W_H( AP.bounds, true );// ширина
	AP_H = GET_W_H( AP.bounds, false );// высота
	return;
};// end GET_AP_W_H
// 
// подпрограмма проверки есть ли открытые документы
// и выделение
function CHECK_DOC()
{
	// если нет открытых документов выход
	if( app.documents.length == 0 ) 
	{
		the_exit( "There are no open documents!" );
	};// if
	// активный документ
	AD = app.activeDocument;
	// получаем выделение в документе
	the_sel = AD.selection;
	// количество объектов в выделении
	N_sel = the_sel.length;
	// если ничего не выделено выход
	if( N_sel == 0 ) 
	{
		the_exit( "There are no selected objects!" );
	};// if
	// если выделены направляющие выход
	if( the_sel[0].constructor.name == "Guide" ) 
	{
		the_exit( "Guides are selected! Can not process that!" );
	};// if
	// текстовая строка для имени активного документа
	AD_NAME = unescape( AD.name );
	// текстовая строка для количества объектов в выделении
	SEL_TEXT += N_sel.toString();
	// проверяем настройки координат = разворот
	RULERS_SPREAD = ( AD.viewPreferences.rulerOrigin == RulerOrigin.spreadOrigin );
	// получаем единицы измерения в документе
	H_UNITS = AD.viewPreferences.horizontalMeasurementUnits;// по горизонтали
	V_UNITS = AD.viewPreferences.verticalMeasurementUnits;// по вертикали
	// текст для единиц измерения
	H_UNITS_TEXT = GET_RULER_UNITS_TEXT( H_UNITS );// по горизонтали
	V_UNITS_TEXT = GET_RULER_UNITS_TEXT( V_UNITS );// по вертикали
	// получаем число точек после запятой
	AFTER_DOT_X = GET_AFTER_DOT( H_UNITS );// по горизонтали
	AFTER_DOT_Y = GET_AFTER_DOT( V_UNITS );// по вертикали
	return;
};// end CHECK_DOC
//
// подпрограмма проверки выделения
function CHECK_SELECTION()
{
	// активный разворот
	AS = app.activeWindow.activeSpread;
	// является ли активная страница мастером
	// вероятно, это происходит тогда, когда активный разворот является мастером :)))
	AP_IS_MASTER = ( AS.constructor.name == "MasterSpread" );
	// количество страниц на активном развороте
	AS_NP = AS.pages.length;
	// формируем информацию о развороте
	// для мастера - имя, для обычного - номер
	SPREAD_INF_TEXT = ( AP_IS_MASTER ) ? ( unescape( AS.name ) ) : ( "#" + (AS.index+1).toString() );
	// проверка поворота вида (отображения) активного разворота
	// если выделение НЕ проверялось
	if( !SEL_CHECKED )
	{
		// поворот вида (отображения) активного разворота
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
			"(Spread " + SPREAD_INF_TEXT + ") is rotated.\n" +
			"To avoid incorrect outcome is strictly recommended\n" +
			"to clear the rotation before in the Pages palette:\n" +
			MENU + "Rotate Spread View –> Clear Rotation.\n\n" +
			"Continue anyway (not recommended) ?";
			// выводим предупреждение
			if( !confirm( AS_ROT_WARNING, true, DLG_TEXT ) )
			{
				// если НЕТ подтверждения на продолжение тогда выход
				the_exit("");
			};// if
		};// if
	};// if
	// получаем размеры страницы из настроек документа
	PAGE_SIZE_DOC_PREF();
	// получаем границы выделения
	SELECTION_DIM();
	// если была ошибка при обработке выделения выход
	if( exit_if_bad_sel )
	{
		the_exit( "Can not process the selection!" );
	};// if
	// получаем активную страницу исходя из выделения
	AP = AS.pages[ ACTIVE_PAGE_INDEX() ];
	// индекс активной страницы
	// если активный мастер-разворот тогда индекс на развороте
	// если НЕ мастер-разворот тогда индекс в документе
	AP_INDEX = ( AP_IS_MASTER ) ? AP.index : AP.documentOffset;
	//alert( AP_INDEX )
	// индекс первой страницы на активном развороте
	// если активный мастер-разворот тогда индекс на развороте
	// если НЕ мастер-разворот тогда индекс в документе
	AS_P1_INDEX = ( AP_IS_MASTER ) ? AS.pages[0].index : AS.pages[0].documentOffset;
	// получаем размеры активной страницы
	GET_AP_W_H();
	// если выделение НЕ проверялось
	if( !SEL_CHECKED )
	{
		// текст для предупреждений
		var WARN_TEXT = "";
		// получаем массив информации о заблокированных объектах в выделении
		// и проверяем возможное выделение белой стрелкой или объект внутри текста
		// цикл по объектам в выделении
		for( var i = 0; i < N_sel; i++ )
		{
			// текущий объект в выделении
			var the_sel_i = the_sel[i];
			// элемент массива информации о выделенном объекте
			// является массивом 
			SEL_INFO[i] = new Array( 2 );
			// если родитель текущего выделенного объекта
			// НЕ разворот, НЕ мастер-разворот, НЕ страница
			// тогда считаем что было выделение белой стрелкой 
			if( !PARENT_SPREAD( the_sel_i ) )
			{ 
				// если объект НЕ внутри текста
				if( !IN_TEXT( the_sel_i ) )
				{
					// если пока :))) не обнаружено выделения белой стрелкой
					if( !WHITE_POINTER )
					{
						// значит будет выделение белой стрелкой :)))
						WHITE_POINTER = true;
					};// if
				}
				// если объект внутри текста
				else
				{
					// сообщение если объект внутри текста
					var MSG =
					"Most likely some selected objects\n"+
					"are inside text! \n" +
					"Can not process that!";
					// выход из скрипта
					the_exit( MSG );
				};// if-else
				// получаем ID его родителя для блокировки-разблокировки
				SEL_INFO[i][1] = GET_PARENT_ID(  the_sel_i );
			}
			// если родитель текущего выделенного объекта
			// разворот или мастер-разворот или страница
			else
			{
				// получаем ID самого объекта
				SEL_INFO[i][1] = the_sel_i.id;
			};// if-else
			// блокировка текущего выделенного объекта
			SEL_INFO[i][0] = the_sel_i.locked;
		};// for
		// если было выделение белой стрелкой
		if( WHITE_POINTER )
		{
			// предупреждение о выделение белой стрелкой
			WARN_TEXT = WARN_TEXT + ( ( WARN_TEXT != "" ) ? ("\n") : ("") ) +
			"Most likely the Direct selection tool (White pointer) was used!\n" +
			"It is recommended to use the Selection tool (Black pointer)\n" +
			"for the script " + DLG_TEXT + ".\n" +
			"Options for centering will be unavailable!\n";
		};// if
		// если были предупреждения
		if( WARN_TEXT != "" )
		{
			// дополняем текст предупреждения
			WARN_TEXT = WARN_HEAD + 
			WARN_TEXT + "\nContinue?";
			// выводим запрос, если нажато No
			if( !confirm( WARN_TEXT, true, DLG_TEXT ) )
			{
				// выход из скрипта
				the_exit("");
			};// if
		};// if
	};// if
	// выделение проверялось
	SEL_CHECKED = true;
	return;
};// end CHECK_SELECTION
//
// подпрограмма для получения информации о выделенном объекте
// является ли его родителем разворот или мастер-разворот или страница
// (выделен ли этот объект черной стрелкой и не является частью составного объекта)
function PARENT_SPREAD( obj )
{
	// название родителя объекта
	var p_name = obj.parent.constructor.name;
	return ( (p_name == "Spread") || (p_name == "MasterSpread") || (p_name == "Page") );
};// end PARENT_SPREAD
// 
// подпрограмма получения ID родителя выделенного объекта
function GET_PARENT_ID( obj )
{
	// цикл пока родитель объекта НЕ разворот, НЕ мастер-разворот, НЕ страница
	while( !PARENT_SPREAD( obj ) )
	{
		// переприсваиваем в объект родителя объекта
		obj = obj.parent;
	};// while
	// возвращаем ID родителя не входящего в составной объект
	return obj.id;
};// end GET_PARENT
//
// подпрограмма определения внедрен ли объект в текстовый фрейм
function IN_TEXT( the_obj_in )
{
	// начальное присвоение объекта
	var the_obj = the_obj_in;
	// имя конструктора родителя объекта
	var p_name = the_obj.parent.constructor.name;
	// цикл выполняется до тех пор пока 
	// имя родителя НЕ документ
	while( p_name != "Document" )
	{
		try
		{
			// родитель объекта
			var p = the_obj.parent;
			// имя конструктора родителя объекта
			p_name = p.constructor.name;
			// если имя конструктора родителя
			// является символом тогда возвращаем истина
			// значит выделенный объект в тексте
			if( p_name == "Character" ) return true;
			// переприсваиваем родителя как объект 
			// для следующего цикла
			the_obj = p;
		} catch( error ) {};// try-catch
	};// while
	// если среди родителей выделенного объекта нет символа
	// тогда возвращаем ложь
	return false;
};// end IN_TEXT
//
// подпрограмма блокировки/разблокировки выделения
function LOCK_SEL( L )
{
	// цикл по объектам в выделении
	for( var i = 0; i < N_sel; i++ )
	{
		// если объект в выделении был заблокирован изначально 
		// до начала операции тогда пропускаем его
		if( SEL_INFO[i][0] ) continue;
		// собственно блокируем (или разблокируем) объект
		// (или его родителя если было выделение белой стрелкой)
		// для этого обращаемся к ним через ID
		AD.pageItems.itemByID( SEL_INFO[i][1] ).locked = L;
	};// for
	return;
};// end LOCK_SEL
//
// подпрограмма получения индекса активной страницы на активном развороте
// исходя из координат выделенных объектов
function ACTIVE_PAGE_INDEX()
{
	// горизонтальный центр выделения 
	// по ВИЗУАЛЬНЫМ границам (с учетом толщины обводки)
	var C = GET_CENTER( SEL_SIZE[1][1], SEL_SIZE[1][3] );
	// цикл по страницам на активном развороте
	for( var i = 0; i < AS_NP; i++ )
	{
		// текущая страницы на развороте
		var P = AS.pages[i];
		// левая граница текущей страницы
		var L = P.bounds[1];
		// правая граница текущей страницы
		var R = P.bounds[3];
		try
		{
			// если самая первая (0) страница на развороте
			// и центр выделения левее ее левой границы
			// тогда она активная страница
			if( ( i == 0 ) && ( C < L ) ) return i;
			// если самая последняя (AS_NP - 1) страница на развороте
			// и центр выделения правее ее правой границы
			// тогда она активная страница
			if( ( i == (AS_NP - 1) ) && ( C >= R ) ) return i;
			// если центр выделения левее левой границы страницы
			// и правее ее правой границы тогда она активная страница
			if( ( C > L ) && ( C <= R ) ) return P.index;
		} catch ( error ) {};// try-catch
	};// for
	// если в цикле по страницам разворота не обнаружена активная страница
	// тогда получаем индекс активной страницы из активного окна документа
	return app.activeWindow.activePage.index;
};// end ACTIVE_PAGE_INDEX
//
// подпрограмма выхода
function the_exit( t )
{
	// если есть текст сообщения
	if( t != "" )
	{
		// выводим это сообщение
		alert( t, DLG_TEXT );
	}
	// если нет текста сообщения
	else
	{
		// восстанавливаем начальные настройки
		RESTORE_SETTINGS();
		// если было выполнение операции и операция была без ошибок
		if( DONE && DONE_OK )
		{
			// строка для предупреждений
			var S = "";
			// если были ошибки при перемещении объектов
			if( MOVE_ERR )
			{
				S += "There were problems\nwith some objects to move!\n\n";
			};// if
			// если было обнуление полей и/или колонок
			if( MARG_ZERO && PAGE_SIZE_CHANGED )
			{
				S += "Margins and/or number of columns\non some pages were changed!\n\n";
			};// if
			if( VERSION_GE_CS5 )
			{
				// получаем размеры страницы из настроек документа
				PAGE_SIZE_DOC_PREF();
				// получаем размер активной страницы
				GET_AP_W_H();
				// если размер страниц или активной страницы 
				// не совпадает с размером в настройках документа
				if( ( DOC_PW != AP_W ) || ( DOC_PH != AP_H ) )
				{
					var DIF_FROM_TEXT = " is different\n" +
					"from size of page in document setup!";
					// активная страница
					if( RANGE == RANGE_AP )
					{
						S += "Size of active page"+
						DIF_FROM_TEXT;
					};// if
					// страницы документа кроме мастеров
					if( RANGE == RANGE_ALL_PAGES )
					{
						S += "Size of non-master pages"+
						DIF_FROM_TEXT;
					};// if
					// активный разворот
					if( RANGE == RANGE_AS )
					{
						S += "Size of pages on active spread"+
						DIF_FROM_TEXT;
					};// if
				};// if
			};// if
			// если были предупреждения
			if( S != "" )
			{ 
				// добавляем заголовок предупреждения
				S = WARN_HEAD + S;
				// выводим предупреждения
				alert( S, DLG_TEXT );
			};// if
		};// if
	};// if-else
	// собственно выход из скрипта
	exit();
};// end the_exit
//
// подпрограмма определения единиц измерения для документа
function GET_RULER_UNITS_TEXT( the_units ) 
{
	for( var i = 0; i < UN_LIST.length; i++ )
	{
		if( the_units == UN_LIST[i][0] ) return UN_LIST[i][1];
	};// for
	return "??";
};// end GET_RULER_UNITS_TEXT;
//
// подпрограмма получения количества точек после запятой
// в зависимости от единиц измерения
function GET_AFTER_DOT( u )
{
	// 3 точки по умолчанию
	var N = 3;
	// 4 точки если дюймы или десятичные дюймы или сантиметры или агаты
	if( u == "in" || u == "ind" || u == "cm" || u == "ag" ) N = 4;
	return N;
};// end GET_AFTER_DOT
//
// подпрограмма вычисления центра между координатами
function GET_CENTER( MIN, MAX )
{
	return ( MIN + ( MAX - MIN ) / 2. );
};// end GET_CENTER
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
// подпрограмма проверки является ли текстовое значение нулевым
function CHECK_ZERO_TEXT( the_text )
{
	// переводим текстовое значение в числовое
	var VAL = parseFloat( TEXT_TO_DIGIT( the_text ) );
	// если текст преобразуется в ноль или в НЕчисло
	// тогда возвращаем "0" иначе оставляем текст как был
	return ( ( VAL == 0. ) || isNaN( VAL ) ) ? ZERO_TEXT : the_text;
};// end CHECK_ZERO_TEXT
//
// подпрограмма перемещения объектов
function MOVE( the_obj, dx, dy )
{
	// проверяем заблокирован ли объект
	var LOCKED = the_obj.locked;
	// если был заблокирован разблокируем
	if( LOCKED ) the_obj.locked = false;
	try
	{
		// пытаемся переместить объект
		the_obj.move( undefined, [ dx, dy ] );
	}
	// если ошибка
	catch( error )
	{
		// тогда ошибка перемещения
		MOVE_ERR = true;
	};// try-catch
	// если объект был заблокирован снова блокируем
	if( LOCKED ) the_obj.locked = true;
	return;
};// end MOVE
//
// подпрограмма перевода логического 
// значения в текстовый вид
function YN( x )
{
	return ( x ? ( "Yes" ) : ( "No" ) );
};// end YN
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