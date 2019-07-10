import colors from './Colors';

export default
{
  TimeRecordRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.color02,
    borderBottomWidth: 1,
    borderBottomColor: colors.color02,
    padding: 10
  },
  TimeRecordRowTotalTime: {
    paddingRight: 15
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
    height: 40,
    borderColor: colors.color02,
    borderWidth: 1,
    marginBottom: 10,
    padding: 10
  },
  FieldsetRow: {
   height: 50
  },
  FieldsetGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  }
};