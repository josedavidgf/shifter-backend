function translateShiftType(type) {
    switch (type) {
      case 'morning':
        return 'de mañana';
      case 'evening':
        return 'de tarde';
      case 'night':
        return 'de noche';
      case 'reinforcement':
        return 'de refuerzo';
      default:
        return type;
    }
  }
  
  module.exports = { translateShiftType };
  