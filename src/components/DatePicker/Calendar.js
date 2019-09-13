import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';

import {
    WEEK_DAYS_JALLALI,
    WEEK_DAYS_GREGORIAN,
    getToday,
    toPersianNumber,
    getMonthName,
    getMonthLength,
    getMonthFirstWeekday,
    createUniqueRange,
    getDateAccordingToMonth,
    isSameDay,
    checkDayInDayRange,
    isBeforeDate,
    shallowCloneObject,
    deepCloneObject,
} from './utils';

const Calendar = ({
                      selectedDayRange,
                      onChange,
                      onDisabledDayError,
                      calendarClassName,
                      calendarTodayClassName,
                      calendarSelectedDayClassName,
                      calendarRangeStartClassName,
                      calendarRangeBetweenClassName,
                      calendarRangeEndClassName,
                      disabledDays,
                      colorPrimary,
                      colorPrimaryLight,
                      minimumDate,
                      maximumDate,
                      selectedInput,
                      isGregorian,
                      inputFromPlaceholder,
                      inputToPlaceholder,
                      toggleLocale
                  }) => {
    const calendarElement = useRef(null);
    const calendarSectionWrapper = useRef(null);
    const [mainState, setMainState] = useState({
        status: 'NEXT',
        activeDate: null,
    });


    const today = getToday(isGregorian);
    let activeDate = mainState.activeDate ? shallowCloneObject(mainState.activeDate) : null;

    const setActiveDate = () => {
        if (selectedDayRange.from) activeDate = shallowCloneObject(selectedDayRange.from);
        else activeDate = shallowCloneObject(today);
    };

    if (!activeDate) setActiveDate();

    const renderWeekDays = () => {
        const weekDays = (isGregorian) ? WEEK_DAYS_GREGORIAN : WEEK_DAYS_JALLALI;
        return (
            Object.keys(weekDays).map(key => (
                <span key={key} className="calendar-weekday">
                    {weekDays[key][0]}
                </span>
            ))
        );
    };


    const getDate = isThisMonth => {
        return isThisMonth ? activeDate : getDateAccordingToMonth(activeDate, "NEXT", isGregorian);
    };

    const getMonthYearText = isThisMonth => {


        const date = getDate(isThisMonth);
        const year = (isGregorian)?date.year:toPersianNumber(date.year);
        const month = getMonthName(date.month, isGregorian);
        return `${month} ${year}`;
    };

    const getDayRangeValue = day => {
        const dayRangeValue = deepCloneObject(selectedDayRange);
        const dayRangeProp = (selectedInput === "start") ? 'from' : 'to';

        dayRangeValue[dayRangeProp] = day;

        // swap from and to values if from is later than to
        if (isBeforeDate(dayRangeValue.to, dayRangeValue.from)) {
            dayRangeValue[(dayRangeProp !== "from") ? 'from' : 'to'] = null;
        }


        const checkIncludingDisabledDay = disabledDay => {
            return checkDayInDayRange({
                day: disabledDay,
                from: dayRangeValue.from,
                to: dayRangeValue.to,
            });
        };
        const includingDisabledDay = disabledDays.find(checkIncludingDisabledDay);
        if (includingDisabledDay) {
            onDisabledDayError(includingDisabledDay);
            return selectedDayRange;
        }

        return dayRangeValue;
    };

    const handleDayClick = day => {
        const newDayValue = getDayRangeValue(day);
        onChange(newDayValue);
    };

    const getDayClassNames = dayItem => {
        const isToday = isSameDay(dayItem, today);
        const isSelected = false;
        const {from: startingDay, to: endingDay} = selectedDayRange;
        const isStartedDayRange = isSameDay(dayItem, startingDay);
        const isEndingDayRange = isSameDay(dayItem, endingDay);
        const isWithinRange = checkDayInDayRange({day: dayItem, from: startingDay, to: endingDay});
        const classNames = ''
            .concat(isToday && !isSelected ? ` day-today ${calendarTodayClassName}` : '')
            .concat(!dayItem.isStandard ? ' day-blank' : '')
            .concat(isSelected ? ` day-selected ${calendarSelectedDayClassName}` : '')
            .concat(isStartedDayRange ? ` day-selected-start ${calendarRangeStartClassName}` : '')
            .concat(isEndingDayRange ? ` day-selected-end ${calendarRangeEndClassName}` : '')
            .concat(isWithinRange ? ` day-selected-between ${calendarRangeBetweenClassName}` : '')
            .concat(dayItem.isDisabled ? 'day-disabled' : '');
        return classNames;
    };

    const getViewMonthDays = isThisMonth => {
        const date = getDate(isThisMonth);
        const prependingBlankDays = createUniqueRange(getMonthFirstWeekday(date), 'starting-blank');

        // all months will have an additional 7 days(week) for rendering purpose
        const appendingBlankDays = createUniqueRange(7 - getMonthFirstWeekday(date), 'ending-blank');
        const standardDays = createUniqueRange(getMonthLength(date)).map(
            day => ({
                ...day,
                isStandard: true,
                month: date.month,
                year: date.year,
            }),
            'standard',
        );
        const allDays = prependingBlankDays.concat(standardDays, appendingBlankDays);
        return allDays;
    };

    const renderMonthDays = isThisMonth => {
        const allDays = getViewMonthDays(isThisMonth);
        return allDays.map(({id, value: day, month, year, isStandard}) => {
            const dayItem = {day, month, year};
            const isInDisabledDaysRange = disabledDays.some(disabledDay =>
                isSameDay(dayItem, disabledDay),
            );
            const isBeforeMinimumDate = isBeforeDate(dayItem, minimumDate);
            const isAfterMaximumDate = isBeforeDate(maximumDate, dayItem);
            const isNotInValidRange = isStandard && (isBeforeMinimumDate || isAfterMaximumDate);
            const isDisabled = isInDisabledDaysRange || isNotInValidRange;
            const additionalClass = getDayClassNames({...dayItem, isStandard, isDisabled});
            return (
                <button
                    tabIndex="-1"
                    key={id}
                    className={`calendar-day ${additionalClass}`}
                    onClick={() => {
                        if (isDisabled) {
                            onDisabledDayError(dayItem); // good for showing error messages
                            return;
                        }
                        handleDayClick({day, month, year});
                    }}
                    disabled={!isStandard}
                    type="button"
                >
                    {(isGregorian)?day:toPersianNumber(day)}
                </button>
            );
        });
    };


    const handleMonthClick = direction => {
        setMainState({
            ...mainState,
            status: direction,
            activeDate: getDateAccordingToMonth(activeDate, direction),

        });
    };

    const isNextMonthArrowDisabled =
        maximumDate &&
        isBeforeDate(maximumDate, {...activeDate, month: activeDate.month + 1, day: 1});
    const isPreviousMonthArrowDisabled =
        minimumDate &&
        (isBeforeDate({...activeDate, day: 1}, minimumDate) ||
            isSameDay(minimumDate, {...activeDate, day: 1}));


    return (
        <div
            className={`calendar ${calendarClassName}`}
            style={{'--cl-color-primary': colorPrimary, '--cl-color-primary-light': colorPrimaryLight}}
            ref={calendarElement}
        >
            <div className="calendar-header">
                <h2 className="header-title">
                    {
                        (selectedInput === "start") ? inputFromPlaceholder : inputToPlaceholder
                    } را انتخاب کنید
                </h2>
                <div className="datepicker-arrows">
                    <button
                        tabIndex="-1"
                        className="calendar-month-arrow-wrapper arrow-right"
                        onClick={() => handleMonthClick('PREVIOUS')}
                        aria-label="ماه قبل"
                        type="button"
                        disabled={isPreviousMonthArrowDisabled}
                    >
                        <i className="calendar-month-arrow">&nbsp;</i>
                        <span>ماه قبل</span>

                    </button>

                    <button
                        tabIndex="-1"
                        className="calendar-month-arrow-wrapper arrow-left"
                        onClick={() => handleMonthClick('NEXT')}
                        aria-label="ماه بعد"
                        type="button"
                        disabled={isNextMonthArrowDisabled}
                    >
                        <span>ماه بعد</span>

                        <i className="calendar-month-arrow">&nbsp;</i>
                    </button>
                </div>
            </div>

            <div ref={calendarSectionWrapper} className="calendar-section-wrapper">

                <div className="first-month">
                    <div className="month-year-title">
                        {getMonthYearText(true)}
                    </div>
                    <div>
                        <div className="calendar-weekdays">{renderWeekDays()}</div>
                        <div
                            className="calendar-section shown">
                            {renderMonthDays(true)}
                        </div>
                    </div>
                </div>
                <div className="second-month">
                    <div className="month-year-title">
                        {getMonthYearText(false)}
                    </div>
                    <div>
                        <div className="calendar-weekdays">{renderWeekDays()}</div>
                        <div
                            className="calendar-section shown">
                            {renderMonthDays(false)}
                        </div>
                    </div>
                </div>

            </div>
            <div className="switch-locale">
                <button className="custom-button" type="button" onClick={toggleLocale}>
                    {(isGregorian)?"تقویم شمسی":"تقویم میلادی"}
                </button>
            </div>

        </div>
    );
};

const dayShape = {
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    day: PropTypes.number.isRequired,
};

Calendar.defaultProps = {
    onChange: () => null,
    onDisabledDayError: () => null,
    selectedDayRange: {
        from: null,
        to: null,
    },
    minimumDate: null,
    maximumDate: null,
    disabledDays: [],
    colorPrimary: '#3389EE',
    colorPrimaryLight: '#3389ee59',
    calendarClassName: '',
    calendarTodayClassName: '',
    calendarSelectedDayClassName: '',
    calendarRangeStartClassName: '',
    calendarRangeBetweenClassName: '',
    calendarRangeEndClassName: '',
    selectorStartingYear: 1350,
    selectorEndingYear: 1450,
    isGregorian: false,
    selectedInput: 'start',
    inputFromPlaceholder: 'تاریخ رفت',
    inputToPlaceholder: 'تاریخ برگشت',
};

Calendar.propTypes = {
    onChange: PropTypes.func,
    onDisabledDayError: PropTypes.func,
    selectedDayRange: PropTypes.shape({
        from: PropTypes.shape(dayShape),
        to: PropTypes.shape(dayShape),
    }),
    disabledDays: PropTypes.arrayOf(PropTypes.shape(dayShape)),
    calendarClassName: PropTypes.string,
    calendarTodayClassName: PropTypes.string,
    calendarSelectedDayClassName: PropTypes.string,
    calendarRangeStartClassName: PropTypes.string,
    calendarRangeBetweenClassName: PropTypes.string,
    calendarRangeEndClassName: PropTypes.string,
    colorPrimary: PropTypes.string,
    colorPrimaryLight: PropTypes.string,
    minimumDate: PropTypes.shape(dayShape),
    maximumDate: PropTypes.shape(dayShape),
    selectorStartingYear: PropTypes.number,
    selectorEndingYear: PropTypes.number,
    isGregorian: PropTypes.bool,
    selectedInput: PropTypes.string,
    inputFromPlaceholder: PropTypes.string,
    inputToPlaceholder: PropTypes.string,
    toggleLocale: PropTypes.func,
};

export {Calendar};
