import React from 'react';import {renderToString} from 'react-dom/server';import {RuntimeButton} from './runtime/Button';
export function renderStandalone(){return renderToString(<RuntimeButton>Standalone</RuntimeButton>)}
