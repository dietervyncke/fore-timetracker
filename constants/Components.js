import colors from './Colors';

export default
{
  TimeRecordRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.color02,
    borderBottomWidth: 1,
    borderBottomColor: colors.color02,
    padding: 20,
    paddingLeft: 15,
    backgroundColor: '#FFFFFF'
  },
  TimeRecordRowTotalTime: {
    paddingLeft: 15,
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  TimeRecordRowMain: {
    flex: 1
  },
  TimeRecordRowHeader: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between'
  },
  TimeRecordRowTimeDetail: {
    flexDirection: 'row'
  },
  TimeRecordRowDescription: {
    paddingTop: 10
  },
  Input: {
    borderWidth: 1,
    borderColor: colors.color06,
    padding: 8
  },
  FieldsetRow: {
   minHeight: 60
  },
  FieldsetGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  TimeRecordDetailSummary: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  TimeRecordDetailCalculation: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: colors.color06
  },
  TimeRecordDetailTotalTime: {
    marginRight: 7,
    color: colors.color01
  },
  TimeRecordDetailBreakDuration: {
    marginLeft: 7,
    padding: 5,
    borderColor: colors.color04,
    borderWidth: 1,
    color: colors.color01
  },
  Title01: {
    fontSize: 24
  },
  Title02: {
    fontSize: 18
  },
  Button: {
    backgroundColor: colors.color02,
    color: colors.color01
  },
  SyncedData: {
    backgroundColor: colors.color07,
  }
};