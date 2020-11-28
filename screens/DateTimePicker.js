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

    constructor(props) {
        super(props);

        this.state = { minuteInterval: 0 };
    }

    componentDidMount() {
        this.setState({ minuteInterval: this.props.minuteInterval })
    }

    render() {

        return (
            <ModalDateTimePicker
                isVisible={this.props.isVisible}
                date={this.props.date}
                mode={this.props.mode}
                minuteInterval={this.state.minuteInterval}
                onConfirm={(date) => {this.props.onConfirm(date)}}
                onCancel={() => {this.props.onCancel()}}
            />
        );
    }
}

export default DateTimePicker;