import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { Calendar } from './Calendar';
import DatePickerInput from './DatePickerInput';

let shouldPreventFocus;
let mousePosition;

const DatePicker = ({
  selectedDay,
  onChange,
  formatInputText,
  inputFromPlaceholder,
  inputToPlaceholder,
  inputClassName,
  renderInput,
  selectedDayRange,
  wrapperClassName,
  calendarClassName,
  calendarTodayClassName,
  calendarSelectedDayClassName,
  calendarRangeStartClassName,
  calendarRangeBetweenClassName,
  calendarRangeEndClassName,
  disabledDays,
  onDisabledDayError,
  colorPrimary,
  colorPrimaryLight,
  minimumDate,
  maximumDate,
  selectorStartingYear,
  selectorEndingYear,
  isGregorian
}) => {
  const calendarContainerElement = useRef(null);
  const dateInputElement = useRef(null);
  const [isCalendarOpen, setCalendarVisiblity] = useState(false);
  const [selectedInput, setSelectedInput] = useState('start');
  const [isGregorianState, setLocale] = useState(isGregorian);

  const handleMouseMove = e => {
    const { clientX: x, clientY: y } = e;
    mousePosition = { x, y };
  };


  const toggleLocale = () => {
    setLocale(!isGregorianState);
    onChange({
      from: null,
      to:null
    })
  };

  // get mouse live position
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove, false);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove, false);
    };
  }, []);

  // handle input focus/blur
  useEffect(() => {
    const shouldCloseCalendar = !isCalendarOpen ;
    if (shouldCloseCalendar) dateInputElement.current.blur();
  }, [selectedDay, isCalendarOpen]);

  const toggleCalendar = () => setCalendarVisiblity(!isCalendarOpen);

  // keep calendar open if clicked inside the calendar
  const handleBlur = e => {
    e.persist();
    if (!isCalendarOpen) return;
    const { current: calendar } = calendarContainerElement;
    const calendarPosition = calendar.getBoundingClientRect();
    const isInBetween = (value, start, end) => value >= start && value <= end;
    const isInsideCalendar =
      isInBetween(mousePosition.x, calendarPosition.left, calendarPosition.right) &&
      isInBetween(mousePosition.y, calendarPosition.top, calendarPosition.bottom);
    if (isInsideCalendar) {
      shouldPreventFocus = true;
      e.target.focus();
      shouldPreventFocus = false;
      return;
    }
    toggleCalendar();
  };

  const handleFocus = (name) => {
    setSelectedInput(name);
    if (shouldPreventFocus) return;
    toggleCalendar();
  };


  const handleDayRangeSelect = range => {
    onChange(range);
    if (range.from && range.to) toggleCalendar();
  };

  // Keep the calendar in the screen bounds if input is near the window edges
  const getCalendarPosition = () => {
    if (!calendarContainerElement.current) return;
    const previousLeft = calendarContainerElement.current.style.left;
    if (previousLeft) return { left: previousLeft };
    const { left, width } = calendarContainerElement.current.getBoundingClientRect();
    const { clientWidth } = document.documentElement;
    const isOverflowingFromRight = left + width > clientWidth;
    const overflowFromRightDistance = left + width - clientWidth;
    const isOverflowingFromLeft = left < 0;
    const overflowFromLeftDistance = Math.abs(left);
    const rightPosition = isOverflowingFromLeft ? overflowFromLeftDistance : 0;
    const leftStyle = isOverflowingFromRight
      ? `calc(50% - ${overflowFromRightDistance}px)`
      : `calc(50% + ${rightPosition}px)`;
    return { left: leftStyle };
  };



  return (
    <div className={`datepicker ${isCalendarOpen ? 'calendar-open' : ''} ${isGregorianState ? ' is-gregorian' : ''} ${wrapperClassName}`}>
      <div
        ref={calendarContainerElement}
        className="datepicker-calendar-container"
        style={getCalendarPosition()}
      >
        <Calendar
          selectedDay={selectedDay}
          onChange={handleDayRangeSelect}
          selectedDayRange={selectedDayRange}
          onDayRangeSelect={handleDayRangeSelect}
          calendarClassName={calendarClassName}
          calendarTodayClassName={calendarTodayClassName}
          calendarSelectedDayClassName={calendarSelectedDayClassName}
          calendarRangeStartClassName={calendarRangeStartClassName}
          calendarRangeBetweenClassName={calendarRangeBetweenClassName}
          calendarRangeEndClassName={calendarRangeEndClassName}
          disabledDays={disabledDays}
          colorPrimary={colorPrimary}
          colorPrimaryLight={colorPrimaryLight}
          onDisabledDayError={onDisabledDayError}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          selectorStartingYear={selectorStartingYear}
          selectorEndingYear={selectorEndingYear}
          selectedInput={selectedInput}
          inputFromPlaceholder={inputFromPlaceholder}
          inputToPlaceholder={inputToPlaceholder}
          isGregorian={isGregorianState}
          toggleLocale={toggleLocale}
        />
      </div>
      <DatePickerInput
        ref={dateInputElement}
        onFocus={handleFocus}
        onBlur={handleBlur}
        formatInputText={formatInputText}
        selectedDayRange={selectedDayRange}
        inputFromPlaceholder={inputFromPlaceholder}
        inputToPlaceholder={inputToPlaceholder}
        inputClassName={inputClassName}
        renderInput={renderInput}
        isGregorian={isGregorianState}
      />
    </div>
  );
};

DatePicker.defaultProps = {
  wrapperClassName: '',
  isGregorian: false,
};

DatePicker.propTypes = {
  wrapperClassName: PropTypes.string,
  isGregorian: PropTypes.bool,
};

export default DatePicker;
