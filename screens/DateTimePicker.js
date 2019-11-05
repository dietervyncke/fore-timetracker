import React from 'react';
import ModalDateTimePicker from "react-native-modal-datetime-picker";

class DateTimePicker extends React.Component {

    static defaultProps = {
        isVisible: true,
        date: new Date(),
        mode: 'date',
        minuteInterval: 15,
        onConfirm: () => {},
        onCancel: () => {}
    };

    render() {
        return (
            <ModalDateTimePicker
                isVisible={this.props.isVisible}
                date={this.props.date}
                mode={this.props.mode}
                minuteInterval={this.props.minuteInterval}
                onConfirm={(date) => {this.props.onConfirm(date)}}
                onCancel={(date) => {this.props.onCancel(date)}}
            />
        );
    }
}

export default DateTimePicker;