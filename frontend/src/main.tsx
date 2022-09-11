import { createApp } from 'solid-utils';
import { MetaProvider } from 'solid-meta';
import {App} from './App';
import './global.css';

createApp(App).use(MetaProvider).mount('#root');
