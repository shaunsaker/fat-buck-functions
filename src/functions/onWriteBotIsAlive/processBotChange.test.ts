import { BotData } from '../../services/firebase/models';
import { makeBotData } from '../../testUtils/makeBotData';
import { makeFirestoreDocument } from '../../testUtils/makeFirestoreDocument';
import { ChangeDocument, processBotChange } from './index';

describe('processBotChange', () => {
  it('does nothing if the after change does not exist', async () => {
    const onSendMail = jest.fn();
    const change: ChangeDocument = {
      before: makeFirestoreDocument<BotData>({
        data: makeBotData({}),
      }),
      after: makeFirestoreDocument<BotData>({
        exists: false,
        data: makeBotData({}),
      }),
    };

    await processBotChange({ change, onSendMail });

    expect(onSendMail).not.toHaveBeenCalled();
  });

  it('does nothing if the bot is still alive', async () => {
    const onSendMail = jest.fn();
    const change: ChangeDocument = {
      before: makeFirestoreDocument<BotData>({
        data: makeBotData({}),
      }),
      after: makeFirestoreDocument<BotData>({
        data: makeBotData({
          isAlive: true,
        }),
      }),
    };

    await processBotChange({ change, onSendMail });

    expect(onSendMail).not.toHaveBeenCalled();
  });

  it('calls sends mail if the bot is not alive', async () => {
    const onSendMail = jest.fn();
    const change: ChangeDocument = {
      before: makeFirestoreDocument<BotData>({
        data: makeBotData({
          isAlive: true,
        }),
      }),
      after: makeFirestoreDocument<BotData>({
        data: makeBotData({
          isAlive: false,
        }),
      }),
    };

    await processBotChange({ change, onSendMail });

    expect(onSendMail).toHaveBeenCalled();
  });
});
