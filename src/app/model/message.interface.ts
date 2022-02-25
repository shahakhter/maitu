export interface Message{
    fromId: string; //~부터
    fromName: string;
    toId: string; //내 ID
    toName: string;
    fromPhoto: string;
    toPhoto: string;
    msg: string;
    timeStamp: Date;
    type: string;
    chatKey: string;
  }