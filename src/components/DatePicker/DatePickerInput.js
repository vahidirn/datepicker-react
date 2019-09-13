import React from 'react';
import PropTypes from 'prop-types';

import {toPersianNumber, putZero} from './utils';

const DatePickerInput = React.forwardRef(
    (
        {
            onFocus,
            onBlur,
            selectedDay,
            selectedDayRange,
            inputFromPlaceholder,
            inputToPlaceholder,
            inputClassName,
            formatInputText,
            renderInput,
            isGregorian
        },
        ref,
    ) => {

        const getValueDateFrom = () => {
            if (formatInputText()) return formatInputText();

            if (!selectedDayRange.from) return '';

            let {from} = selectedDayRange;

            from = (isGregorian)?from:{
                year: toPersianNumber(putZero(from.year)),
                month: toPersianNumber(putZero(from.month)),
                day: toPersianNumber(putZero(from.day))
            };

            return `${putZero(from.year)
                .toString()
                .slice(-2)}/${putZero(from.month)}/${putZero(from.day)}`;
        };

        const getValueDateTo = () => {
            if (formatInputText()) return formatInputText();

            if (!selectedDayRange.to) return '';

            let {to} = selectedDayRange;

            to = (isGregorian)?to:{
                year: toPersianNumber(putZero(to.year)),
                month: toPersianNumber(putZero(to.month)),
                day: toPersianNumber(putZero(to.day))
            };

            return `${putZero(to.year)
                .toString()
                .slice(-2)}/${putZero(to.month)}/${putZero(to.day)}`;
        };

        const render = () => {
            return (
                renderInput({ref, onFocus, onBlur}) || (
                    <div className={`datepicker-inputs `}>
                        <div className="start-date-section">

                            <input
                                ref={ref}
                                onFocus={() => onFocus('start')}
                                onBlur={onBlur}
                                value={getValueDateFrom()}
                                onChange={(event)=>this.inputChangedHandler(event)}
                                className={`datepicker-input ${inputClassName}`}
                                aria-label="انتخاب تاریخ"
                            /> <label className="datepicker-label">
                            {inputFromPlaceholder}
                        </label>
                        </div>
                        <div className="end-date-section">
                            <input
                                ref={ref}
                                onFocus={() => onFocus('end')}
                                onBlur={onBlur}
                                value={getValueDateTo()}
                                onChange={(event)=>this.inputChangedHandler(event)}
                                className={`datepicker-input ${inputClassName}`}
                                aria-label="انتخاب تاریخ"
                            />
                            <label className="datepicker-label">
                                {inputToPlaceholder}
                            </label>
                        </div>
                    </div>

                )
            );
        };

        return render();
    },
);

DatePickerInput.defaultProps = {
    formatInputText: () => '',
    renderInput: () => null,
    inputFromPlaceholder: 'تاریخ رفت',
    inputToPlaceholder: 'تاریخ برگشت',
    inputClassName: '',
    isGregorian: false,
};

DatePickerInput.propTypes = {
    formatInputText: PropTypes.func,
    inputFromPlaceholder: PropTypes.string,
    inputToPlaceholder: PropTypes.string,
    inputClassName: PropTypes.string,
    renderInput: PropTypes.func,
    isGregorian: PropTypes.bool,
};

export default DatePickerInput;
