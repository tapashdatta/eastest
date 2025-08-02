// app/splash.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/Text';
import LottieView from 'lottie-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/CommonStyles';
import { SvgXml } from 'react-native-svg';
import DailyQuoteScreen from '@/screens/DailyQuoteScreen';
import { DailyQuotesService } from '@/services/DailyQuotesService';

const { width, height } = Dimensions.get('window');

// Simple SVG logo for faster loading
const simpleDotSvg = `
<svg id="Layer_1" style="enable-background:new 0 0 589.6 589.6;" version="1.1" viewBox="0 0 589.6 589.6" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px" xmlns:bx="https://boxy-svg.com" width="589.6px" height="589.6px"><defs><bx:export><bx:file format="svg"/></bx:export></defs><g><circle class="st0" fill="none" stroke="#bfa075" stroke-width="10.3" stroke-linecap="round" stroke-miterlimit="10" stroke-dasharray="0,4.8" cx="295" cy="39.9" r="0.7"/><circle class="st0" fill="none" stroke="#bfa075" stroke-width="10.3" stroke-linecap="round" stroke-miterlimit="10" stroke-dasharray="0,4.8" cx="295" cy="540.9" r="0.7"/><g><circle class="st1" fill="none" stroke="#bfa075" stroke-width="7" stroke-linecap="round" stroke-miterlimit="10" stroke-dasharray="0,11.0106" cx="295" cy="294" r="289.1"/></g></g><g><g><g><path class="st2" fill="#bfa075" d="M357,327.5c-13.7,0-20.8,9.8-20.8,20.4c0,11.6,8.8,20.2,20.8,20.2c12,0,20.8-8.6,20.8-20.2 C377.8,337.2,370.7,327.5,357,327.5z M357,365.6c-7.1,0-12.7-7.6-12.7-17.7c0-9.4,4.6-17.9,12.7-17.9c8.1,0,12.7,8.6,12.7,17.9 C369.8,358,364.1,365.6,357,365.6z"/><path class="st2" fill="#bfa075" d="M307.7,329.8c7.8,0,10.4,4.9,11.4,8.6c0.1,0.4,0.4,0.5,1.1,0.4c0.6-0.1,0.8-0.3,0.8-0.7 c-0.5-3.5-0.7-6.5-0.7-8.1c0-0.7-0.1-0.8-0.9-1c-3.8-0.9-8.1-1.6-11.7-1.6c-12.2,0-22.9,7.1-22.9,20.5c0,13.9,10,20.4,23,20.4 c4.1,0,8.8-1.1,10.7-1.9c0.6-0.2,0.8-0.4,1.1-0.9c0.8-1.6,1.9-4.6,2.3-8.1c0-0.3-0.2-0.5-0.8-0.6c-0.6-0.1-0.9,0-1,0.3 c-1.7,3.8-4.7,8.7-12.1,8.7c-7.6,0-15.4-6.1-15.4-18.6C292.8,335.1,300.3,329.8,307.7,329.8"/><path class="st2" fill="#bfa075" d="M236.3,365.5l-1.3,0.2c-0.4,0.1-0.5,0.4-0.5,0.9c0,0.5,0.2,0.8,0.6,0.8c0,0,5.1-0.2,7.9-0.2s7.9,0.2,7.9,0.2 c0.4,0,0.5-0.3,0.6-0.8c0-0.5-0.1-0.9-0.5-0.9l-1.3-0.2c-2.8-0.3-3.3-0.5-3.3-6.8V350c0,0,0.8-1.5,1.4-1.7 c0.7-0.2,1.2,0.1,1.9,0.9c2.9,3.4,9,11.4,11.6,14.8c0.7,0.9,0.2,1.3-0.6,1.5l-1.5,0.2c-0.3,0.1-0.5,0.4-0.4,0.9 c0,0.5,0.2,0.8,0.6,0.8c0,0,5-0.2,7.7-0.2s7.7,0.2,7.7,0.2c0.3,0,0.6-0.2,0.6-0.8c0-0.6-0.2-0.9-0.5-0.9 c-3.7-0.3-4.5-1.1-6.1-2.9c-3.7-4.2-11.2-13.7-14.2-17.7c-0.4-0.5-0.4-0.9,0.1-1.5c1.7-1.8,7.1-7.3,9.5-9.5c2.8-2.6,5-3.5,9-4.1 c0.3-0.1,0.6-0.5,0.5-1c-0.1-0.4-0.2-0.7-0.6-0.7c0,0-4.2,0.2-6.5,0.2c-2.3,0-6.4-0.2-6.4-0.2c-0.3,0-0.5,0.3-0.6,0.8 c0,0.5,0.1,0.8,0.4,0.9l1.6,0.5c0.3,0.1,0.5,0.2,0.6,0.5c0.1,0.7-1.2,2.1-2.9,4c-2.3,2.6-6.4,6.9-8.5,9c-1.8,1.7-2.5,2-3.2,1.7 c-0.6-0.3-0.4-2.6-0.4-2.6v-6.2c0-6.2,0.5-6.3,3.2-6.7l1.3-0.2c0.4-0.1,0.5-0.4,0.5-0.9c0-0.5-0.2-0.8-0.6-0.8 c0,0-5.1,0.2-7.8,0.2c-2.7,0-7.8-0.2-7.8-0.2c-0.4,0-0.5,0.3-0.6,0.8c0,0.5,0.1,0.9,0.4,0.9l1.3,0.2c2.7,0.3,3.3,0.5,3.3,6.7 v21.9c0,6.2-0.5,6.4-3.3,6.8"/><path class="st2" fill="#bfa075" d="M426.5,356.6l-0.4,0.5v-0.9c-7.3-7.4-17.5-18.8-23.7-27.2c-0.4-0.5-0.5-0.7-1.2-0.7 c-3.2,0.2-7.5,0.1-10.1-0.1c-0.4,0-0.5,0.3-0.6,0.8c0,0.5,0.1,0.9,0.5,0.9c4.5,0.9,5.7,2.2,5.7,6.9v20.1c0,6.8-0.5,8.1-3.2,8.5 l-1.3,0.2c-0.3,0.1-0.5,0.4-0.4,0.9c0,0.5,0.2,0.8,0.5,0.8c2.2-0.1,4.3-0.2,5.9-0.2c1.5,0,3.6,0.1,5.9,0.2c0.4,0,0.5-0.3,0.5-0.8 c0-0.5-0.1-0.8-0.4-0.9l-1.2-0.2c-2.7-0.3-3.2-1.7-3.2-8.5V337c-0.2-0.2-0.4-0.4-0.5-0.5l0.5-0.3v0.9c7.5,7.8,18.7,20.8,27.2,31 c0.4,0.5,0.8,0.5,1.5,0.2c0.7-0.3,0.8-0.6,0.8-1.1c-0.1-2.9-0.2-5.8-0.2-8.4v-20c0-6.8,0.5-8.2,3.3-8.5l1.3-0.2 c0.4-0.1,0.5-0.4,0.4-0.9c0-0.5-0.2-0.8-0.5-0.8c-2.3,0.1-4.4,0.2-5.9,0.2c-1.5,0-4.3-0.1-6.5-0.2c-0.4,0-0.5,0.3-0.6,0.8 c0,0.5,0.2,0.9,0.4,0.9c4.6,0.3,5.2,1.2,5.2,8.7v17.5C426.3,356.3,426.4,356.5,426.5,356.6"/><path class="st2" fill="#bfa075" d="M478,244.8c-17.5-7.1-34.5-11.9-50.5-14.3c10.5-23.8,10.7-44.5,20.9-60.8c0.9-1.4,0.7-1.9-0.9-2 c-18.6-1.5-36.4-0.2-52.4,3.4c-3-18.4-5.2-36.4,1.9-57.2c0.5-1.6,0.2-2.3-1.4-1.5c-15.5,7.7-33.5,20.9-48.6,38.2 c-11.5-22.9-28.2-44.2-32.8-76.9c-0.3-2.1-1.3-1.9-0.9,0v149.7c-0.5,13.1-9.6,19.3-18.3,19.3c-8.7,0-17.9-6.2-17.8-19.3V73.6 c-0.1-1.9-1.1-2.1-1.4,0c-4.6,32.8-21.3,54-32.8,76.9c-15.1-17.3-33.2-30.5-48.6-38.2c-1.6-0.8-2-0.1-1.4,1.5 c7.1,20.7,4.9,38.7,1.9,57.2c-16-3.6-33.8-4.9-52.4-3.4c-1.6,0.1-1.8,0.6-0.9,2c10.2,16.3,10.4,37,20.9,60.8 c-16.1,2.4-33,7.2-50.5,14.3c-1.5,0.6-1.5,1.4,0.4,1.5c24.2,1,60,40.2,102.1,40.2c35.9,0,56.9-24.4,61.8-50.9 c-0.2-0.4-0.4-0.8-0.5-1.1l0.8-0.2c-0.1,0.4-0.2,0.9-0.2,1.3c2.9,5.8,8.6,9.2,14.5,10.2c0.5-0.1,1-0.2,1.5-0.2l-0.1,0.4 c-0.5-0.1-1-0.1-1.4-0.2c-9.2,1.6-16.4,8.8-16.4,18c0,15.3,15,20.3,19.5,31.9c0.3,0.8,0.5,1.6,1.1,1.6c0.7,0,0.8-0.8,1.1-1.6 c4.5-11.6,19.5-16.5,19.5-31.9c0-9.2-7.2-16.4-16.4-18c-0.5,0.1-1,0.2-1.4,0.2l-0.1-0.4c0.5,0.1,1,0.1,1.5,0.2 c5.9-1,11.6-4.4,14.5-10.2c-0.1-0.4-0.2-0.9-0.2-1.3l0.8,0.2c-0.2,0.4-0.3,0.8-0.5,1.2c4.9,26.5,26,50.9,61.8,50.9 c42,0,77.9-39.2,102.1-40.2C479.4,246.2,479.4,245.4,478,244.8z M240.7,155.4c-4.2,9.3-7.4,19-8.5,30 c-8.8-5.2-18.8-9.4-29.8-12.4c2.6-16.4,4.1-33.1-1.2-49.4C214,130.4,228.3,141.5,240.7,155.4z M201.5,178.6 c11.9,3.1,22,7.3,30.4,12.3c0,0.6,0,1.3,0,1.9c0,23.6,9.7,42.3,21.9,56c-16.2-11.2-34.7-17.7-55.1-19.6c-0.9-4.7-1.4-10-1.4-15.7 C197.3,202.4,199.5,190.6,201.5,178.6z M150.2,173.3c16.5-0.4,31.1,0.9,43.8,3.5c-1.8,11-3.6,22.3-3.6,34.5 c0,6.2,0.6,12.1,1.6,17.5c-7.2-0.3-14.5,0-22.1,0.8C159.8,205.5,159.9,188.7,150.2,173.3z M254.6,269.9 c-8.5,7.6-21.1,12.6-36.5,12.6c-34.9,0-62.6-30.8-88.1-37.5c11.7-4.4,23.4-7.5,35.1-9.3c14.2,28.5,38.4,42.5,62.9,42.5 C237.8,278.3,246.9,275.2,254.6,269.9c0.3-0.3,0.6-0.5,0.9-0.8l0.9-0.5C255.8,269,255.2,269.4,254.6,269.9z M229.6,275.2 c-22.4,0-45.1-14-57.3-40.4c0,0,0-0.1,0-0.1c7.1-0.8,14.1-1,21-0.8c6.3,23.4,22.9,37.1,45.1,37.1c6.2,0,13.3-2,19.7-6.3 C251.4,271.4,241.4,275.2,229.6,275.2z M238.5,268.6c-14.2,0-32.1-9.8-38.7-34.2c23.2,1.9,44.9,9.7,63,23.9 C256.1,265.2,247,268.6,238.5,268.6z M264.1,255.9c-12.7-12.2-27.1-31-27.1-56.8c0-1.7,0-3.3,0.2-4.9 c20.6,14.1,29.6,32.9,29.6,48.5C266.7,247.5,265.8,251.9,264.1,255.9z M267.6,252.8c1.3-3.2,1.9-7.7,1.9-11 c0-21.3-12.1-39.8-31.8-53.1c1.3-10,4.5-18.7,8.5-26.9c15.5,19.3,26.9,43.1,26.9,68.6C273.1,238.8,270.6,247.7,267.6,252.8z M273.2,209.7h-0.5v-2.4c-4-18.7-13.1-35.7-24.5-50.3c8.5-16.1,19.3-31.2,24.5-52.2v-2h0.5c-0.2,0.7-0.3,1.3-0.5,2v102.5 C272.9,208.1,273.1,208.9,273.2,209.7z M439.8,173.3c-9.7,15.4-9.6,32.2-19.7,56.3c-7.6-0.8-14.9-1.1-22.1-0.8 c1.1-5.4,1.6-11.3,1.6-17.5c0-12.2-1.8-23.5-3.6-34.5C408.7,174.2,423.3,172.9,439.8,173.3z M392.7,213.5c0,5.7-0.5,11-1.4,15.7 c-20.4,1.9-39,8.4-55.1,19.6c12.2-13.6,21.9-32.3,21.9-56c0-0.7,0-1.3,0-1.9c8.4-5,18.5-9.2,30.4-12.3 C390.5,190.6,392.7,202.4,392.7,213.5z M388.8,123.5c-5.3,16.3-3.7,33-1.2,49.4c-11,3.1-21.1,7.3-29.8,12.4 c-1-11-4.2-20.7-8.5-30C361.7,141.5,376,130.4,388.8,123.5z M316.6,102.9h0.5v2c5.2,21,16.1,36.1,24.5,52.2 c-11.4,14.6-20.5,31.6-24.5,50.2v2.4h-0.5c0.2-0.8,0.3-1.6,0.5-2.4V104.9C316.9,104.3,316.7,103.6,316.6,102.9z M316.9,230.4 c0-25.5,11.4-49.3,26.9-68.6c4,8.3,7.2,17,8.5,26.9c-19.8,13.3-31.8,31.8-31.8,53.1c0,3.3,0.6,7.8,1.9,11 C319.4,247.7,316.9,238.8,316.9,230.4z M323.3,242.6c0-15.5,9-34.3,29.6-48.5c0.1,1.6,0.2,3.2,0.2,4.9 c0,25.7-14.4,44.5-27.1,56.8C324.2,251.9,323.3,247.5,323.3,242.6z M327.2,258.3c18.1-14.2,39.7-22,63-23.9 c-6.5,24.4-24.5,34.2-38.7,34.2C343,268.6,333.9,265.2,327.2,258.3z M351.7,271.1c22.2,0,38.8-13.7,45.1-37.1 c6.9-0.2,13.9,0,21,0.8c0,0,0,0.1-0.1,0.1c-12.2,26.4-35,40.4-57.3,40.4c-11.9,0-21.8-3.8-28.4-10.4 C338.4,269.1,345.6,271.1,351.7,271.1z M371.9,282.5c-15.4,0-28-5-36.5-12.6c-0.6-0.4-1.2-0.9-1.8-1.3l0.9,0.5 c0.3,0.3,0.6,0.5,0.9,0.8c7.6,5.3,16.8,8.4,26.7,8.4c24.5,0,48.7-14.1,62.9-42.5c11.6,1.8,23.4,4.9,35.1,9.3 C434.6,251.7,406.8,282.5,371.9,282.5z"/><path class="st2" fill="#bfa075" d="M157.4,365.3l-1.3,0.2c-0.4,0.1-0.5,0.4-0.4,0.9c0,0.5,0.2,0.8,0.6,0.8c0,0,5.1-0.2,7.8-0.2 c2.7,0,7.8,0.2,7.8,0.2c0.4,0,0.5-0.3,0.6-0.8c0-0.5-0.1-0.9-0.4-0.9l-1.3-0.2c-2.7-0.3-3.2-0.5-3.2-6.7V337 c0-6.2,0.5-6.3,3.2-6.7l1.3-0.2c0.4-0.1,0.5-0.4,0.4-0.9c0-0.5-0.2-0.8-0.6-0.8c0,0-5.1,0.2-7.8,0.2c-2.7,0-7.8-0.2-7.8-0.2 c-0.4,0-0.5,0.3-0.6,0.8c0,0.5,0.1,0.9,0.4,0.9l1.3,0.2c2.7,0.3,3.2,0.5,3.2,6.7v21.6C160.7,364.7,160.2,364.9,157.4,365.3"/><path class="st2" fill="#bfa075" d="M203.5,365.7c-6.3,0-9.5-5.3-11-9.3c-0.1-0.4-0.4-0.5-1-0.4c-0.5,0.1-0.9,0.2-1,0.7 c-0.1,2.3,0.3,5.7,1.2,7.7c0.4,0.9,0.7,1.2,1.5,1.6c1.9,0.9,5.2,2,10.4,2c9.4,0,14.8-4.9,14.8-11.8c0-6.9-4.6-9.9-11.8-12.2 c-4.9-1.6-8.7-3.6-8.7-8.1c0-3.1,2.4-6.2,7.2-6.2c5.4,0,7.4,4,8.4,7c0.2,0.4,0.5,0.5,1.1,0.5c0.6-0.1,0.9-0.3,0.9-0.6 c0-2.3-0.5-5.5-1-7.2c-0.2-0.6-0.3-0.8-1.2-1c-1.8-0.5-4.7-1-7.6-1c-9.3,0-14,4.9-14,10.7c0,6.7,5.5,10.1,12.1,12.3 c6.6,2.2,7.8,5,7.8,8.3C211.6,362.8,208.4,365.7,203.5,365.7"/></g></g><g><path class="st2" fill="#bfa075" d="M221.2,484.3h-0.1c0-0.6-0.2-1.1-0.7-1.5c-0.4-0.4-0.9-0.6-1.5-0.6h-0.4v-0.3h2.7V484.3z M221.2,503.2v2.5 h-2.7v-0.3h0.4c0.6,0,1.1-0.2,1.5-0.6c0.4-0.4,0.6-0.9,0.7-1.5H221.2z M227.1,481.9v23.8h-6v-23.8H227.1z M236.6,481.9v1.6H227 v-1.6H236.6z M234.8,493.2v1.6H227v-1.6H234.8z M236,504.1l1.1,1.6H227v-1.6H236z M238.6,498.3l-1.4,7.4h-7l1.2-1.6 c1.1,0,2.1-0.2,3-0.7c0.9-0.5,1.7-1.1,2.3-2c0.7-0.9,1.2-1.9,1.5-3.1H238.6z M234.8,489.6v3.6h-3.6v-0.1c1,0,1.7-0.4,2.4-1 c0.6-0.6,0.9-1.4,0.9-2.3v-0.2H234.8z M234.8,494.6v3.6h-0.3V498c0-0.9-0.3-1.7-0.9-2.3c-0.6-0.6-1.4-0.9-2.3-1v-0.1H234.8z M236.6,483.4v4.4h-0.3v-0.3c0-1.2-0.3-2.2-1-2.9c-0.7-0.7-1.6-1.1-2.9-1.1v-0.1H236.6z M236.6,481.3v1l-4.1-0.4 c0.5,0,1,0,1.6-0.1c0.6-0.1,1.1-0.1,1.5-0.2S236.3,481.3,236.6,481.3z"/><path class="st2" fill="#bfa075" d="M247.8,484.9c0.4,0,0.9,0,1.6,0.1s1.4,0.1,2.1,0.2c0.7,0.1,1.4,0.1,2,0.2c0.6,0.1,0.9,0.2,1.1,0.2l-0.6,4.4 h-0.2c0-1-0.4-1.9-1.2-2.6c-0.8-0.7-1.8-1-3.2-1c-1.1,0-1.9,0.2-2.6,0.7c-0.6,0.4-1,1-1.1,1.8c0,0.5,0.1,0.8,0.3,1.2 c0.2,0.3,0.5,0.6,0.9,0.8c0.4,0.2,0.8,0.5,1.3,0.7l4.9,2.7c1,0.5,1.8,1.2,2.4,2.1c0.6,0.9,0.9,2.1,0.7,3.5 c-0.1,1.4-0.5,2.5-1.2,3.5c-0.7,1-1.7,1.7-3,2.2c-1.3,0.5-2.7,0.7-4.5,0.7c-1.1,0-2-0.1-2.9-0.2c-0.9-0.2-1.6-0.4-2.2-0.7 c-0.6-0.3-1-0.6-1.3-1c-0.2-0.5-0.3-1.1-0.3-1.8s0.2-1.4,0.4-2.1c0.2-0.7,0.5-1.2,0.8-1.7h0.2c0,1,0.2,2,0.6,2.9 c0.4,0.9,1.1,1.6,2,2.2c0.9,0.6,2,0.8,3.3,0.9c1.3,0,2.2-0.3,2.8-0.9c0.6-0.6,0.9-1.3,0.9-2c0-0.6-0.2-1.2-0.7-1.7 c-0.5-0.5-1.2-1-2.3-1.5l-4.2-2.4c-1.3-0.6-2.2-1.4-2.8-2.5s-0.8-2.3-0.6-3.6c0.1-1.1,0.5-2.1,1-2.9s1.3-1.4,2.2-1.8 S246.6,484.9,247.8,484.9z M254.6,485.2l-0.1,0.6h-4v-0.6H254.6z"/><path class="st2" fill="#bfa075" d="M257.8,484.7c0.2,0.1,0.5,0.1,0.8,0.2s0.8,0.1,1.3,0.2s0.9,0.1,1.3,0.1l-3.5,0.3V484.7z M277.9,485.2v1.5h-20 v-1.5H277.9z M261.7,486.6v0.1c-1.1,0-2,0.4-2.6,1c-0.6,0.6-0.9,1.5-0.9,2.7v0.2h-0.3v-4H261.7z M265,503.6v2.1h-2.2v-0.3h0.3 c0.5,0,1-0.2,1.3-0.5C264.7,504.5,264.9,504.1,265,503.6L265,503.6z M270.8,485.4v20.3h-5.8v-20.3H270.8z M270.6,503.6h0.1 c0,0.5,0.1,0.9,0.5,1.3c0.4,0.3,0.8,0.5,1.3,0.5h0.3v0.3h-2.3V503.6z M277.9,486.6v4h-0.3v-0.2c0-1.1-0.3-2-0.9-2.7 c-0.6-0.6-1.5-1-2.6-1v-0.1H277.9z M277.9,484.7v0.9l-3.5-0.3c0.4,0,0.9,0,1.3-0.1s0.9-0.1,1.3-0.2 C277.5,484.9,277.7,484.8,277.9,484.7z"/><path class="st2" fill="#bfa075" d="M280.1,506.1c-0.7,0-1.4-0.3-1.9-0.8c-0.5-0.5-0.8-1.2-0.8-1.9c0-0.8,0.3-1.4,0.8-2c0.5-0.5,1.2-0.8,1.9-0.8 c0.8,0,1.4,0.3,2,0.8s0.8,1.2,0.8,2c0,0.7-0.3,1.4-0.8,1.9S280.9,506.1,280.1,506.1z"/><path class="st2" fill="#bfa075" d="M294.8,505.7l0-0.3h0.7c0.5,0,1-0.2,1.3-0.5c0.4-0.4,0.5-0.8,0.5-1.3v-17.4c0-0.8-0.2-1.4-0.6-1.7 c-0.4-0.3-0.9-0.5-1.5-0.5h-0.7v-0.3c0.5,0,1.1-0.1,1.8-0.2c0.7-0.1,1.5-0.2,2.3-0.4c0.8-0.2,1.6-0.4,2.4-0.6s1.4-0.6,2-0.9h0.3 v22.1c0,0.5,0.2,0.9,0.6,1.3c0.4,0.4,0.8,0.5,1.3,0.5h0.7v0.3H294.8z"/><path class="st2" fill="#bfa075" d="M311.3,507l-0.1-0.2c2.3-0.7,4.1-1.5,5.4-2.5c1.3-0.9,2.3-2,3-3.2c0.7-1.2,1.1-2.6,1.3-4.1 c0.2-1.5,0.3-3.2,0.3-5c0-1.9-0.1-3.5-0.2-4.7s-0.4-2.2-0.9-2.9c-0.4-0.6-1.1-1-2-1c-0.9,0-1.6,0.3-2.1,0.8 c-0.5,0.6-0.8,1.3-1,2.2s-0.3,1.9-0.3,2.9c0,1.2,0.1,2.2,0.3,3s0.4,1.3,0.8,1.7c0.4,0.4,0.7,0.6,1.2,0.7c0.6,0.2,1.1,0.2,1.6,0 c0.5-0.2,0.9-0.4,1.2-0.6l0.2,0.3c-0.4,0.7-0.9,1.3-1.6,1.7c-0.7,0.5-1.5,0.7-2.3,0.9c-0.9,0.1-1.7,0.1-2.6-0.1 c-0.9-0.2-1.7-0.6-2.4-1.2c-0.7-0.6-1.3-1.4-1.8-2.3c-0.4-1-0.7-2.2-0.6-3.6c0-1.5,0.4-2.9,1.1-4.1s1.7-2.2,3.1-2.9 s3.1-1.1,5.2-1.1c3.2,0,5.6,0.8,7.3,2.6c1.7,1.8,2.6,4.6,2.6,8.3c0,2.3-0.3,4.3-1,6.2c-0.7,1.9-1.7,3.5-3.1,4.8 c-1.4,1.3-3.1,2.3-5.1,2.9C316.5,507,314.1,507.2,311.3,507z"/><path class="st2" fill="#bfa075" d="M347.5,480.7l0.1,0.2c-2.3,0.7-4.1,1.5-5.4,2.5s-2.3,2-3,3.2c-0.6,1.2-1.1,2.6-1.3,4.1 c-0.2,1.5-0.3,3.2-0.3,5c0,1.9,0.1,3.4,0.2,4.7c0.2,1.3,0.5,2.2,0.9,2.9c0.4,0.6,1.1,1,2,1s1.6-0.3,2-0.8c0.5-0.6,0.8-1.3,1-2.2 c0.2-0.9,0.3-1.9,0.3-2.9c0-1.2-0.1-2.2-0.3-3c-0.2-0.7-0.5-1.3-0.8-1.7c-0.3-0.4-0.7-0.6-1.2-0.7c-0.5-0.2-1-0.2-1.5,0 c-0.5,0.2-0.9,0.4-1.3,0.6l-0.2-0.3c0.4-0.7,0.9-1.3,1.6-1.8c0.7-0.4,1.5-0.7,2.4-0.9c0.9-0.1,1.7-0.1,2.6,0.1 c0.9,0.2,1.7,0.6,2.4,1.2c0.7,0.6,1.3,1.4,1.8,2.3c0.4,1,0.7,2.2,0.6,3.7c0,1.5-0.3,2.8-1,4.1s-1.7,2.2-3.1,3 c-1.4,0.7-3.1,1.1-5.2,1.2c-2.1,0-3.9-0.4-5.3-1.1s-2.6-2-3.3-3.6s-1.2-3.7-1.2-6.2c0-2.3,0.3-4.4,1-6.3c0.7-1.9,1.7-3.5,3.1-4.8 c1.4-1.3,3.1-2.3,5.1-2.9C342.3,480.6,344.7,480.5,347.5,480.7z"/><path class="st2" fill="#bfa075" d="M355.1,507l-0.1-0.2c2.3-0.7,4.1-1.5,5.4-2.5c1.3-0.9,2.3-2,3-3.2c0.7-1.2,1.1-2.6,1.3-4.1 c0.2-1.5,0.3-3.2,0.3-5c0-1.9-0.1-3.5-0.2-4.7s-0.4-2.2-0.9-2.9c-0.4-0.6-1.1-1-2-1c-0.9,0-1.6,0.3-2.1,0.8 c-0.5,0.6-0.8,1.3-1,2.2s-0.3,1.9-0.3,2.9c0,1.2,0.1,2.2,0.3,3s0.4,1.3,0.8,1.7c0.4,0.4,0.7,0.6,1.2,0.7c0.6,0.2,1.1,0.2,1.6,0 c0.5-0.2,0.9-0.4,1.2-0.6l0.2,0.3c-0.4,0.7-0.9,1.3-1.6,1.7c-0.7,0.5-1.5,0.7-2.3,0.9c-0.9,0.1-1.7,0.1-2.6-0.1 c-0.9-0.2-1.7-0.6-2.4-1.2c-0.7-0.6-1.3-1.4-1.8-2.3c-0.4-1-0.7-2.2-0.6-3.6c0-1.5,0.4-2.9,1.1-4.1s1.7-2.2,3.1-2.9 s3.1-1.1,5.2-1.1c3.2,0,5.6,0.8,7.3,2.6c1.7,1.8,2.6,4.6,2.6,8.3c0,2.3-0.3,4.3-1,6.2c-0.7,1.9-1.7,3.5-3.1,4.8 c-1.4,1.3-3.1,2.3-5.1,2.9C360.3,507,357.9,507.2,355.1,507z"/></g><g><path class="st2" fill="#bfa075" d="M165,394.1v31.7h10.9v5.2h-16.4v-36.9H165z"/><path class="st2" fill="#bfa075" d="M188.6,412.4c0-5.2,1.9-9.7,5.7-13.4c3.8-3.7,8.4-5.6,13.7-5.6c5.3,0,9.8,1.9,13.5,5.6 c3.8,3.8,5.7,8.3,5.7,13.6c0,5.3-1.9,9.8-5.7,13.5c-3.8,3.7-8.4,5.6-13.8,5.6c-4.8,0-9.1-1.7-12.8-5 C190.7,423.1,188.6,418.3,188.6,412.4z M194.2,412.5c0,4.1,1.4,7.4,4.1,10.1c2.7,2.6,5.9,3.9,9.5,3.9c3.9,0,7.1-1.3,9.8-4 c2.7-2.7,4-6,4-9.9c0-3.9-1.3-7.2-3.9-9.9c-2.6-2.7-5.9-4-9.7-4c-3.8,0-7.1,1.3-9.7,4C195.5,405.3,194.2,408.6,194.2,412.5z"/><path class="st2" fill="#bfa075" d="M245,431.1v-39.5l26.9,28.2v-25.7h5.6v39.2l-26.9-28.1v25.9H245z"/><path class="st2" fill="#bfa075" d="M297.1,431.1v-36.9h7.8c3.7,0,6.7,0.4,8.8,1.1c2.3,0.7,4.4,1.9,6.3,3.7c3.8,3.5,5.7,8,5.7,13.7 c0,5.7-2,10.3-6,13.8c-2,1.8-4.1,3-6.3,3.7c-2,0.7-4.9,1-8.7,1H297.1z M302.7,425.8h2.5c2.5,0,4.6-0.3,6.2-0.8 c1.7-0.6,3.2-1.4,4.5-2.7c2.7-2.5,4.1-5.8,4.1-9.8c0-4.1-1.4-7.3-4.1-9.9c-2.4-2.2-6-3.4-10.8-3.4h-2.5V425.8z"/><path class="st2" fill="#bfa075" d="M341.7,412.4c0-5.2,1.9-9.7,5.7-13.4c3.8-3.7,8.4-5.6,13.7-5.6c5.3,0,9.8,1.9,13.5,5.6 c3.8,3.8,5.7,8.3,5.7,13.6c0,5.3-1.9,9.8-5.7,13.5c-3.8,3.7-8.4,5.6-13.8,5.6c-4.8,0-9.1-1.7-12.8-5 C343.7,423.1,341.7,418.3,341.7,412.4z M347.3,412.5c0,4.1,1.4,7.4,4.1,10.1c2.7,2.6,5.9,3.9,9.5,3.9c3.9,0,7.1-1.3,9.8-4 c2.7-2.7,4-6,4-9.9c0-3.9-1.3-7.2-3.9-9.9c-2.6-2.7-5.9-4-9.7-4c-3.8,0-7.1,1.3-9.7,4C348.6,405.3,347.3,408.6,347.3,412.5z"/><path class="st2" fill="#bfa075" d="M398.1,431.1v-39.5l26.9,28.2v-25.7h5.6v39.2l-26.9-28.1v25.9H398.1z"/></g><g><path class="st2" fill="#bfa075" d="M453,328.4c1.5,0,2.8,0.4,4.1,1.1c1.2,0.7,2.2,1.7,3,3c0.7,1.2,1.1,2.6,1.1,4.1c0,1.5-0.4,2.8-1.1,4.1 c-0.7,1.2-1.7,2.2-3,3c-1.2,0.7-2.6,1.1-4.1,1.1c-1.5,0-2.8-0.4-4.1-1.1s-2.2-1.7-3-3c-0.7-1.2-1.1-2.6-1.1-4.1 c0-1.5,0.4-2.8,1.1-4.1c0.7-1.2,1.7-2.2,3-3S451.5,328.4,453,328.4z M453,329.9c-1.8,0-3.4,0.7-4.7,2c-1.3,1.3-2,2.9-2,4.7 c0,1.8,0.7,3.4,2,4.7c1.3,1.3,2.9,2,4.7,2c1.8,0,3.4-0.7,4.7-2c1.3-1.3,2-2.9,2-4.7c0-1.8-0.7-3.4-2-4.7 C456.4,330.5,454.8,329.9,453,329.9z M450.2,332l-0.2,0.9c0-0.5-0.3-0.8-0.8-0.8H449V332H450.2z M450.2,340.6H449v-0.1h0.1 c0.5,0,0.8-0.3,0.8-0.8L450.2,340.6z M451.7,332v8.6H450V332H451.7z M453.2,332c0.9,0,1.6,0.2,2.2,0.6c0.6,0.4,0.9,1,0.9,1.8 c0,0.6-0.2,1.2-0.6,1.6c-0.4,0.4-0.9,0.7-1.5,0.8c0.3,0,0.7,0.4,1.1,0.9c0.4,0.6,0.7,1.1,0.9,1.4c0.1,0.1,0.3,0.4,0.5,0.7 c0.2,0.3,0.6,0.5,1,0.7v0.1h-0.9c-1.2,0-2-0.4-2.5-1.1c-0.5-0.7-0.9-1.4-1.3-2.2c-0.1-0.2-0.3-0.5-0.4-0.6 c-0.1-0.2-0.3-0.3-0.5-0.3v-0.1c0.3,0,0.6,0,0.8,0c0,0,0.2,0,0.5-0.1c0.3-0.1,0.6-0.5,0.8-1.1c0.1-0.3,0.1-0.6,0.1-0.9 c0-1.1-0.6-1.6-1.7-1.5l-0.9-0.1l-0.1-0.6H453.2z M451.7,339.7c0,0.5,0.2,0.8,0.7,0.8h0.2v0.1h-1.2L451.7,339.7z"/></g></g><g><path class="st3" fill="#bfa075" stroke="#bfa075" stroke-miterlimit="10" d="M318.3,457.9h-46.5c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1h46.5c0.6,0,1.1,0.5,1.1,1.1l0,0 C319.3,457.4,318.9,457.9,318.3,457.9z"/><path class="st4" fill="#bfa075" stroke="#bfa075" stroke-width="1.7" stroke-miterlimit="10" d="M434.2,315.7H155.8c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1h278.5c0.6,0,1.1,0.5,1.1,1.1l0,0 C435.3,315.2,434.8,315.7,434.2,315.7z"/><path class="st4" fill="#bfa075" stroke="#bfa075" stroke-width="1.7" stroke-miterlimit="10" d="M434.2,381.9H155.8c-0.6,0-1.1-0.5-1.1-1.1l0,0c0-0.6,0.5-1.1,1.1-1.1h278.5c0.6,0,1.1,0.5,1.1,1.1l0,0 C435.3,381.4,434.8,381.9,434.2,381.9z"/></g></svg>
`;

// Loading Animation Component
const LoadingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const duration = 600;
      const delay = 200;

      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(dot1, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      ).start();

      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot2, {
              toValue: 1,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(dot2, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);

      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot3, {
              toValue: 1,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(dot3, {
              toValue: 0,
              duration,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay * 2);
    };

    animateDots();
  }, []);

  return (
    <View style={loadingStyles.container}>
      <Animated.View
        style={[
          loadingStyles.dot,
          {
            opacity: dot1,
            transform: [
              {
                scale: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          loadingStyles.dot,
          {
            opacity: dot2,
            transform: [
              {
                scale: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          loadingStyles.dot,
          {
            opacity: dot3,
            transform: [
              {
                scale: dot3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
};

const loadingStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
});

export default function SplashScreen() {
  const animationRef = useRef<LottieView>(null);
  const { user, status, isInitialized } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [showDailyQuote, setShowDailyQuote] = useState(false);
  const [quoteCheckComplete, setQuoteCheckComplete] = useState(false);

  useEffect(() => {
    console.log('🎬 Splash screen mounted');
    animationRef.current?.play();

    // Ensure splash shows for minimum 2.5 seconds
    const minTimer = setTimeout(() => {
      console.log('⏰ Minimum time elapsed');
      setMinTimeElapsed(true);
    }, 3500);

    // Check if daily quote should be shown
    checkDailyQuote();

    return () => {
      clearTimeout(minTimer);
    };
  }, []);

  const checkDailyQuote = async () => {
    try {
      console.log('🔍 Checking if daily quote should be shown...');
      const shouldShow = await DailyQuotesService.shouldShowQuoteToday();
      console.log('📅 Daily quote check result:', shouldShow);
      
      setShowDailyQuote(shouldShow);
    } catch (error) {
      console.error('❌ Error checking daily quote:', error);
      setShowDailyQuote(false);
    } finally {
      setQuoteCheckComplete(true);
    }
  };

  const handleQuoteClose = async () => {
    try {
      console.log('📝 Marking daily quote as shown...');
      await DailyQuotesService.markQuoteShownToday();
      setShowDailyQuote(false);
      console.log('✅ Daily quote marked as shown');
    } catch (error) {
      console.error('❌ Error marking quote as shown:', error);
      setShowDailyQuote(false);
    }
  };

  // Navigation logic - only proceed after minimum time and quote check
  useEffect(() => {
    if (minTimeElapsed && quoteCheckComplete && !hasNavigated) {
      console.log('🧭 Ready to navigate:', { 
        user: !!user, 
        status, 
        isInitialized,
        minTimeElapsed,
        quoteCheckComplete,
        showDailyQuote
      });
      
      // If we should show daily quote, don't navigate yet
      if (showDailyQuote) {
        console.log('📖 Showing daily quote first');
        return;
      }
      
      // Navigate to appropriate screen
      const navigationTimer = setTimeout(() => {
        setHasNavigated(true);
        
        if (user && status === 'authenticated') {
          console.log('👤 User authenticated, going to tabs');
          router.replace('/(tabs)');
        } else {
          console.log('🚪 No authenticated user, going to welcome');
          router.replace('/(auth)/welcome');
        }
      }, 500);

      return () => clearTimeout(navigationTimer);
    }
  }, [minTimeElapsed, quoteCheckComplete, showDailyQuote, user, status, hasNavigated]);

  // Handle quote close and then navigate
  const handleQuoteCloseAndNavigate = async () => {
    await handleQuoteClose();
    
    // Small delay then navigate
    setTimeout(() => {
      setHasNavigated(true);
      
      if (user && status === 'authenticated') {
        console.log('👤 User authenticated, going to tabs (after quote)');
        router.replace('/(tabs)');
      } else {
        console.log('🚪 No authenticated user, going to welcome (after quote)');
        router.replace('/(auth)/welcome');
      }
    }, 300);
  };

  // Show daily quote if it should be shown and all checks are complete
  if (minTimeElapsed && quoteCheckComplete && showDailyQuote) {
    return <DailyQuoteScreen onClose={handleQuoteCloseAndNavigate} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* BACKGROUND LAYERS - Copied from welcome screen */}
      {/* Top White Background with curved bottom */}
      <View style={styles.topBackground} />
      
      {/* Bottom Gradient Background */}
      <LinearGradient
        colors={['#989e6e','#b1b28d', '#5A7A63', '#3E5B47']}
        style={styles.bottomBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* CONTENT CONTAINER */}
      <View style={styles.contentContainer}>
        {/* Simple SVG Logo */}
        <View style={styles.logoContainer}>
          <SvgXml xml={simpleDotSvg} width={100} height={100} />
        </View>

        {/* Brand Section */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>GROW</Text>
          <Text style={styles.brandSubtitle}>WITH ISKCON LONDON</Text>
        </View>
        
        {/* Lottie Animation */}
        <View style={styles.animationContainer}>
          <LottieView
            ref={animationRef}
            source={require('@/assets/animation/splash.json')}
            autoPlay={true}
            loop={true}
            speed={0.8}
            style={styles.lottieAnimation}
            resizeMode="contain"
          />
        </View>
        
        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {!quoteCheckComplete 
              ? 'Preparing your spiritual journey...' 
              : 'Connecting to your spiritual journey...'
            }
          </Text>
          <LoadingDots />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  /* BACKGROUND LAYERS - Copied from welcome screen */
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6, // 45% of screen
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 1,
  },
  bottomBackground: {
    position: 'absolute',
    top: height * 0.55, // Start at 40%
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  
  /* CONTENT CONTAINER */
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.95, // Use most of the screen
    paddingHorizontal: Spacing.xxxl,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-around', // Space elements evenly
    alignItems: 'center',
    zIndex: 10,
  },
  
  /* BRAND SECTION */
  brandContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    ...Typography.displaySmall,
    color: '#bfa075',
    letterSpacing: 6,
    fontSize: 34,
    fontWeight: '700',
  },
  brandSubtitle: {
    color: Colors.text,
    letterSpacing: 6,
    textTransform: 'uppercase',
    fontSize: 12,
    marginTop: 4,
  },
  
  /* LOGO */
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  /* ANIMATION */
  animationContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  
  /* LOADING */
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 16,
  },
});