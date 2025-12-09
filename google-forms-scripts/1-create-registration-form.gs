/**
 * Скрипт для создания Google Form - Заявка на регистрацию в Школьный Парламент
 * 
 * ИНСТРУКЦИЯ:
 * 1. Откройте https://script.google.com
 * 2. Создайте новый проект
 * 3. Вставьте этот код
 * 4. Нажмите "Выполнить" (Run) -> выберите функцию createRegistrationForm
 * 5. При первом запуске нужно будет авторизоваться
 * 6. После выполнения скрипт выведет ссылку на созданную форму
 */

function createRegistrationForm() {
  // Создаем новую форму
  var form = FormApp.create('Заявка на регистрацию в Школьный Парламент');
  
  // Описание формы
  form.setDescription('Заполните эту форму, чтобы подать заявку на участие в Школьном Парламенте. После рассмотрения заявки администратором вы получите уведомление на указанный email.');
  
  // Настройки формы
  form.setCollectEmail(true); // Собираем email
  form.setAllowResponseEdits(true); // Разрешаем редактирование ответов
  form.setShowLinkToRespondAgain(false); // Не показываем ссылку на повторную отправку
  
  // 1. ФИО (Полное имя)
  var fullNameItem = form.addTextItem();
  fullNameItem.setTitle('ФИО (Полное имя)');
  fullNameItem.setHelpText('Введите ваше полное имя (например: Иванов Иван Иванович)');
  fullNameItem.setRequired(true);
  
  // 2. Телефон
  var phoneItem = form.addTextItem();
  phoneItem.setTitle('Телефон');
  phoneItem.setHelpText('Введите ваш номер телефона (например: +7 705 669 76 77)');
  phoneItem.setRequired(true);
  
  // 3. Email (автоматически собирается, но можно добавить для подтверждения)
  var emailItem = form.addTextItem();
  emailItem.setTitle('Email (подтверждение)');
  emailItem.setHelpText('Подтвердите ваш email адрес');
  emailItem.setRequired(true);
  // Добавляем валидацию email
  var emailValidation = FormApp.createTextValidation()
    .setHelpText('Введите корректный email адрес')
    .requireTextMatchesPattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
    .build();
  emailItem.setValidation(emailValidation);
  
  // 4. Логин от Bilim Class (необязательное)
  var bilimClassItem = form.addTextItem();
  bilimClassItem.setTitle('Логин от платформы Bilim Class');
  bilimClassItem.setHelpText('Если у вас есть логин от Bilim Class, укажите его здесь. Логин для сайта заполнится автоматически, но вы сможете его изменить.');
  bilimClassItem.setRequired(false);
  
  // 5. Логин для сайта
  var loginItem = form.addTextItem();
  loginItem.setTitle('Логин для сайта');
  loginItem.setHelpText('Придумайте логин для входа на сайт (минимум 3 символа). Если вы указали логин от Bilim Class, это поле заполнится автоматически, но вы можете его изменить.');
  loginItem.setRequired(true);
  var loginValidation = FormApp.createTextValidation()
    .setHelpText('Логин должен содержать минимум 3 символа')
    .requireTextMatchesPattern('.{3,}')
    .build();
  loginItem.setValidation(loginValidation);
  
  // 6. Класс (только цифра)
  var classItem = form.addTextItem();
  classItem.setTitle('Класс');
  classItem.setHelpText('Введите только цифру класса (например: 9, 10, 11)');
  classItem.setRequired(true);
  var classValidation = FormApp.createTextValidation()
    .setHelpText('Введите только цифру от 1 до 11')
    .requireTextMatchesPattern('^([1-9]|1[01])$')
    .build();
  classItem.setValidation(classValidation);
  
  // 7. Литер класса
  var classLetterItem = form.addTextItem();
  classLetterItem.setTitle('Литер класса');
  classLetterItem.setHelpText('Введите литер класса (одна буква, например: Д, А, Б). Без кавычек.');
  classLetterItem.setRequired(false);
  var letterValidation = FormApp.createTextValidation()
    .setHelpText('Введите одну букву (без кавычек)')
    .requireTextMatchesPattern('^[А-Яа-яA-Za-z]$')
    .build();
  classLetterItem.setValidation(letterValidation);
  
  // Добавляем разделитель
  form.addPageBreakItem();
  
  // Информационный блок
  var infoItem = form.addSectionHeaderItem();
  infoItem.setTitle('Важная информация');
  infoItem.setHelpText('После подачи заявки администратор рассмотрит её и свяжется с вами. Обычно это занимает 1-2 рабочих дня.');
  
  // Получаем ссылку на форму
  var formUrl = form.getPublishedUrl();
  var formEditUrl = form.getEditUrl();
  
  // Выводим результаты
  Logger.log('✅ Форма успешно создана!');
  Logger.log('📋 Ссылка на форму (для заполнения): ' + formUrl);
  Logger.log('✏️ Ссылка на редактирование формы: ' + formEditUrl);
  
  // Также выводим в виде alert (если запускается из редактора)
  SpreadsheetApp.getUi().alert(
    'Форма создана!\n\n' +
    'Ссылка на форму: ' + formUrl + '\n\n' +
    'Ссылка на редактирование: ' + formEditUrl
  );
  
  return {
    formUrl: formUrl,
    editUrl: formEditUrl
  };
}

