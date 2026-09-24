// script.js
// Полностью функциональная таблица с выбором факультета

class StudentTableManager {
  constructor() {
    this.tableBody = document.getElementById('tableBody');
    this.modal = document.getElementById('studentModal');
    this.form = document.getElementById('studentForm');
    this.modalTitle = document.getElementById('modalTitle');
    this.currentEditRow = null;
    
    this.init();
  }
  
  updateRowNumbers() {
    const rows = this.tableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
      row.cells[0].innerText = index + 1;
    });
    this.updateStats();
  }
  
  updateStats() {
    const rows = this.tableBody.querySelectorAll('tr');
    const count = rows.length;
    document.getElementById('studentCount').innerText = count;
  }
  
  getFacultyDisplayName(facultyValue) {
    const facultyMap = {
      'Информационных технологий': '💻 Информационных технологий',
      'Экономический': '📊 Экономический',
      'Юридический': '⚖️ Юридический',
      'Медицинский': '🏥 Медицинский',
      'Инженерный': '🔧 Инженерный',
      'Филологический': '📖 Филологический',
      'Физико-математический': '🔬 Физико-математический',
      'Химический': '🧪 Химический',
      'Биологический': '🧬 Биологический',
      'Психологии': '🧠 Психологии',
      'Журналистики': '📰 Журналистики',
      'Дизайна': '🎨 Дизайна',
      'Архитектуры': '🏛️ Архитектуры',
      'Социологии': '👥 Социологии',
      'Политологии': '🗳️ Политологии'
    };
    return facultyMap[facultyValue] || facultyValue;
  }
  
  addStudent(data) {
    const newRow = document.createElement('tr');
    const rowNum = this.tableBody.querySelectorAll('tr').length + 1;
    
    const facultyDisplay = this.getFacultyDisplayName(data.faculty);
    
    newRow.innerHTML = `
      <td>${rowNum}</td>
      <td contenteditable="false">${this.escapeHtml(data.name)}</td>
      <td contenteditable="false">${facultyDisplay}</td>
      <td contenteditable="false">${this.escapeHtml(data.course)}</td>
      <td contenteditable="false">${this.escapeHtml(data.group)}</td>
      <td contenteditable="false"><span class="status-badge" data-status="${this.escapeHtml(data.status)}">${this.escapeHtml(data.status)}</span></td>
      <td class="actions-cell">
        <button class="action-btn edit-btn" title="Редактировать">✏️</button>
        <button class="action-btn delete-btn" title="Удалить">🗑️</button>
      </td>
    `;
    
    // Сохраняем原始ное значение факультета в data-атрибуте
    newRow.querySelector('td:nth-child(3)').setAttribute('data-faculty-value', data.faculty);
    
    this.tableBody.appendChild(newRow);
    this.attachRowEvents(newRow);
    this.updateRowNumbers();
    this.showNotification('Студент добавлен', 'success');
  }
  
  editStudent(row, data) {
    const facultyDisplay = this.getFacultyDisplayName(data.faculty);
    
    row.cells[1].innerText = this.escapeHtml(data.name);
    row.cells[2].innerHTML = facultyDisplay;
    row.cells[2].setAttribute('data-faculty-value', data.faculty);
    row.cells[3].innerText = this.escapeHtml(data.course);
    row.cells[4].innerText = this.escapeHtml(data.group);
    const statusSpan = row.cells[5].querySelector('.status-badge');
    statusSpan.innerText = this.escapeHtml(data.status);
    statusSpan.setAttribute('data-status', this.escapeHtml(data.status));
    this.showNotification('Данные обновлены', 'success');
  }
  
  deleteStudent(row) {
    if (confirm('Удалить этого студента?')) {
      row.remove();
      this.updateRowNumbers();
      this.showNotification('Студент удален', 'info');
    }
  }
  
  attachRowEvents(row) {
    const editBtn = row.querySelector('.edit-btn');
    const deleteBtn = row.querySelector('.delete-btn');
    
    if (editBtn) editBtn.addEventListener('click', () => this.openEditModal(row));
    if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteStudent(row));
  }
  
  openAddModal() {
    this.currentEditRow = null;
    this.modalTitle.innerText = 'Добавить студента';
    this.form.reset();
    document.getElementById('studentFaculty').value = '';
    this.modal.style.display = 'block';
  }
  
  openEditModal(row) {
    this.currentEditRow = row;
    this.modalTitle.innerText = 'Редактировать студента';
    
    document.getElementById('studentName').value = row.cells[1].innerText;
    
    // Получаем原始ное значение факультета
    const facultyValue = row.cells[2].getAttribute('data-faculty-value') || this.getFacultyValueFromDisplay(row.cells[2].innerText);
    document.getElementById('studentFaculty').value = facultyValue;
    
    document.getElementById('studentCourse').value = row.cells[3].innerText;
    document.getElementById('studentGroup').value = row.cells[4].innerText;
    const currentStatus = row.cells[5].querySelector('.status-badge').innerText;
    document.getElementById('studentStatus').value = currentStatus;
    
    this.modal.style.display = 'block';
  }
  
  getFacultyValueFromDisplay(displayText) {
    const reverseMap = {
      '💻 Информационных технологий': 'Информационных технологий',
      '📊 Экономический': 'Экономический',
      '⚖️ Юридический': 'Юридический',
      '🏥 Медицинский': 'Медицинский',
      '🔧 Инженерный': 'Инженерный',
      '📖 Филологический': 'Филологический',
      '🔬 Физико-математический': 'Физико-математический',
      '🧪 Химический': 'Химический',
      '🧬 Биологический': 'Биологический',
      '🧠 Психологии': 'Психологии',
      '📰 Журналистики': 'Журналистики',
      '🎨 Дизайна': 'Дизайна',
      '🏛️ Архитектуры': 'Архитектуры',
      '👥 Социологии': 'Социологии',
      '🗳️ Политологии': 'Политологии'
    };
    return reverseMap[displayText] || displayText;
  }
  
  saveStudent(formData) {
    if (!formData.name.trim()) {
      this.showNotification('Введите ФИО студента', 'error');
      return false;
    }
    
    if (!formData.faculty) {
      this.showNotification('Выберите факультет', 'error');
      return false;
    }
    
    if (this.currentEditRow) {
      this.editStudent(this.currentEditRow, formData);
    } else {
      this.addStudent(formData);
    }
    return true;
  }
  
  exportToCSV() {
    const rows = this.tableBody.querySelectorAll('tr');
    if (rows.length === 0) {
      this.showNotification('Нет данных для экспорта', 'info');
      return;
    }
    
    const headers = ['№', 'ФИО студента', 'Факультет', 'Курс', 'Группа', 'Статус'];
    const data = [headers];
    
    rows.forEach(row => {
      const rowData = [
        row.cells[0].innerText,
        row.cells[1].innerText,
        row.cells[2].innerText.replace(/[💻📊⚖️🏥🔧📖🔬🧪🧬🧠📰🎨🏛️👥🗳️]\s/, ''), // Убираем эмодзи
        row.cells[3].innerText,
        row.cells[4].innerText,
        row.cells[5].innerText
      ];
      data.push(rowData);
    });
    
    const csvContent = data.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'students_list.csv');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.showNotification('Экспорт выполнен успешно', 'success');
  }
  
  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerText = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      font-weight: 500;
      z-index: 2000;
      animation: slideIn 0.3s ease;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  }
  
  init() {
    // Добавляем стили для анимаций уведомлений
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Привязываем события ко всем существующим строкам
    const existingRows = this.tableBody.querySelectorAll('tr');
    existingRows.forEach(row => this.attachRowEvents(row));
    this.updateStats();
    
    // Кнопка добавления
    document.getElementById('addStudentBtn').addEventListener('click', () => this.openAddModal());
    
    // Кнопка экспорта
    document.getElementById('exportBtn').addEventListener('click', () => this.exportToCSV());
    
    // Закрытие модального окна
    const closeBtn = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const closeModal = () => this.modal.style.display = 'none';
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) closeModal();
    });
    
    // Отправка формы
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = {
        name: document.getElementById('studentName').value,
        faculty: document.getElementById('studentFaculty').value,
        course: document.getElementById('studentCourse').value || '1',
        group: document.getElementById('studentGroup').value || '—',
        status: document.getElementById('studentStatus').value
      };
      
      if (this.saveStudent(formData)) {
        this.modal.style.display = 'none';
        this.form.reset();
      }
    });
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new StudentTableManager();
});