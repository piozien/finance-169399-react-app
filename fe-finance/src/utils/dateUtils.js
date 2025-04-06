const formatDateUS = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const formatDateShortUS = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
};

const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
};

const parseInputDate = (inputValue) => {
    if (!inputValue) return '';
    const date = new Date(inputValue);
    return date.toISOString();
};

const dateUtils = {
    formatDateUS,
    formatDateShortUS,
    formatDateForInput,
    parseInputDate
};

export default dateUtils;
