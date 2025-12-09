/**
 * Скрипт для создания Google Form - Предложение идеи/мероприятия
 * 
 * ИНСТРУКЦИЯ:
 * 1. Откройте https://script.google.com
 * 2. Создайте новый проект
 * 3. Вставьте этот код
 * 4. Нажмите "Выполнить" (Run) -> выберите функцию createIdeaForm
 * 5. При первом запуске нужно будет авторизоваться
 * 6. После выполнения скрипт выведет ссылку на созданную форму
 */

function createIdeaForm() {
  // Создаем новую форму
  var form = FormApp.create('Предложение идеи или мероприятия');
  
  // Описание формы
  form.setDescription('У вас есть крутая идея для мероприятия или проекта? Поделитесь ею с нами! Лучшие идеи мы обязательно реализуем. После рассмотрения идеи вы получите обратную связь.');
  
  // Настройки формы
  form.setCollectEmail(true); // Собираем email
  form.setAllowResponseEdits(true); // Разрешаем редактирование ответов
  form.setShowLinkToRespondAgain(true); // Разрешаем повторную отправку
  
  // 1. ФИО
  var fullNameItem = form.addTextItem();
  fullNameItem.setTitle('Ваше ФИО');
  fullNameItem.setHelpText('Введите ваше полное имя');
  fullNameItem.setRequired(true);
  
  // 2. Класс
  var classItem = form.addTextItem();
  classItem.setTitle('Ваш класс');
  classItem.setHelpText('Введите ваш класс (например: 9Д, 10А)');
  classItem.setRequired(true);
  
  // 3. Email (автоматически собирается, но можно добавить для подтверждения)
  var emailItem = form.addTextItem();
  emailItem.setTitle('Email (подтверждение)');
  emailItem.setHelpText('Подтвердите ваш email адрес для обратной связи');
  emailItem.setRequired(true);
  var emailValidation = FormApp.createTextValidation()
    .setHelpText('Введите корректный email адрес')
    .requireTextMatchesPattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
    .build();
  emailItem.setValidation(emailValidation);
  
  // 4. Тип предложения
  var typeItem = form.addMultipleChoiceItem();
  typeItem.setTitle('Тип предложения');
  typeItem.setChoices([
    typeItem.createChoice('Мероприятие'),
    typeItem.createChoice('Проект'),
    typeItem.createChoice('Идея для улучшения школы'),
    typeItem.createChoice('Другое')
  ]);
  typeItem.setRequired(true);
  
  // 5. Министерство (если применимо)
  var ministryItem = form.addMultipleChoiceItem();
  ministryItem.setTitle('К какому министерству относится идея?');
  ministryItem.setHelpText('Выберите министерство, которое может реализовать эту идею (если применимо)');
  ministryItem.setChoices([
    ministryItem.createChoice('Права и порядка'),
    ministryItem.createChoice('Информации'),
    ministryItem.createChoice('Спорта'),
    ministryItem.createChoice('Заботы'),
    ministryItem.createChoice('Не относится к конкретному министерству')
  ]);
  ministryItem.setRequired(false);
  
  // 6. Название идеи/мероприятия
  var titleItem = form.addTextItem();
  titleItem.setTitle('Название идеи/мероприятия');
  titleItem.setHelpText('Краткое и понятное название вашей идеи');
  titleItem.setRequired(true);
  
  // 7. Описание идеи
  var descriptionItem = form.addParagraphTextItem();
  descriptionItem.setTitle('Подробное описание');
  descriptionItem.setHelpText('Опишите вашу идею подробно: что вы хотите предложить, как это можно реализовать, какие ресурсы нужны, кто может участвовать и т.д.');
  descriptionItem.setRequired(true);
  
  // 8. Категория
  var categoryItem = form.addMultipleChoiceItem();
  categoryItem.setTitle('Категория');
  categoryItem.setChoices([
    categoryItem.createChoice('Культура и искусство'),
    categoryItem.createChoice('Спорт'),
    categoryItem.createChoice('Образование'),
    categoryItem.createChoice('Волонтерство'),
    categoryItem.createChoice('Развлечения'),
    categoryItem.createChoice('Социальные проекты'),
    categoryItem.createChoice('Другое')
  ]);
  categoryItem.setRequired(true);
  
  // 9. Предполагаемая дата/период (если это мероприятие)
  var dateItem = form.addTextItem();
  dateItem.setTitle('Предполагаемая дата или период проведения');
  dateItem.setHelpText('Если это мероприятие, укажите когда вы хотели бы его провести (например: "Декабрь 2024" или "Каждую пятницу")');
  dateItem.setRequired(false);
  
  // 10. Ожидаемое количество участников
  var participantsItem = form.addTextItem();
  participantsItem.setTitle('Ожидаемое количество участников');
  participantsItem.setHelpText('Сколько человек, по вашему мнению, могут принять участие?');
  participantsItem.setRequired(false);
  
  // 11. Нужна ли помощь в организации?
  var helpItem = form.addMultipleChoiceItem();
  helpItem.setTitle('Готовы ли вы помочь в организации?');
  helpItem.setChoices([
    helpItem.createChoice('Да, готов(а) активно участвовать'),
    helpItem.createChoice('Да, могу помочь частично'),
    helpItem.createChoice('Нет, только предложил(а) идею')
  ]);
  helpItem.setRequired(true);
  
  // 12. Дополнительные комментарии
  var commentsItem = form.addParagraphTextItem();
  commentsItem.setTitle('Дополнительные комментарии');
  commentsItem.setHelpText('Любая дополнительная информация, которая может быть полезна');
  commentsItem.setRequired(false);
  
  // Добавляем разделитель
  form.addPageBreakItem();
  
  // Информационный блок
  var infoItem = form.addSectionHeaderItem();
  infoItem.setTitle('Что дальше?');
  infoItem.setHelpText('После рассмотрения вашей идеи администрацией и министерствами, вы получите обратную связь на указанный email. Если идея будет одобрена, мы свяжемся с вами для обсуждения деталей реализации.');
  
  // Получаем ссылку на форму
  var formUrl = form.getPublishedUrl();
  var formEditUrl = form.getEditUrl();
  
  // Выводим результаты
  Logger.log('✅ Форма успешно создана!');
  Logger.log('📋 Ссылка на форму (для заполнения): ' + formUrl);
  Logger.log('✏️ Ссылка на редактирование формы: ' + formEditUrl);
  
  // Выводим в консоль выполнения
  console.log('✅ Форма успешно создана!');
  console.log('📋 Ссылка на форму (для заполнения): ' + formUrl);
  console.log('✏️ Ссылка на редактирование формы: ' + formEditUrl);
  
  return {
    formUrl: formUrl,
    editUrl: formEditUrl,
    message: 'Форма успешно создана! Проверьте логи выполнения для получения ссылок.'
  };
}

