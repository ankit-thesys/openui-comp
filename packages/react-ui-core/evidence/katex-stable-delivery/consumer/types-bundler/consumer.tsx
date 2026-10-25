import{createElement}from'react';import{TextContentWrapper,MarkDownRenderer,type TextContentWrapperProps,type MarkDownRendererProps}from'@openuidev/react-ui-core';
const props:TextContentWrapperProps={textMarkdown:'$$x^2$$',variant:'card'};createElement(TextContentWrapper,props);const base:MarkDownRendererProps={textMarkdown:'Text'};createElement(MarkDownRenderer,base);
// @ts-expect-error No new styling API.
const bad:TextContentWrapperProps={textMarkdown:'x',sx:{color:'red'}};void bad;
