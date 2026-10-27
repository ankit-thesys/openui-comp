import {createElement} from 'react';
import chat = require('@openuidev/chat-kit');
import library = require('@openuidev/chat-kit/libs');
const props: chat.FollowUpItemProps = {text:'go'};
const block:chat.FollowUpBlockProps={children:createElement(chat.FollowUpItem,{text:'next'})};
const model:chat.ModelOption={id:'a',name:'A'};
const logo:chat.ModelLogo='A';
const switcher:chat.ModelSwitcherProps={models:[model],value:'a',onValueChange:()=>{}};
void [chat.FollowUpBlock,chat.FollowUpItem,chat.ModelSwitcher,props,block,logo,switcher,library.openuiChatLibrary,library.openuiChatPromptOptions,library.openuiChatAdditionalRules,library.openuiChatComponentGroups,library.openuiChatExamples];
