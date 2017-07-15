# react-native-slide

![version](https://img.shields.io/npm/v/react-native-slide.svg?style=flat-square)

A Slide written in pure javascript for cross-platform support.

Needs react-native >= 0.14.2

### Documentation

#### Props
- <b>height</b> number, height of the slide
- <b>autoPlay</b> number, the interval of autoplay. Unset this param to forbid autoplay.
- <b>showPagination</b> bool, show pagination or not
- <b>paginationStyle</b> viewStylePropType, style of pagination
- <b>paginationWrapStyle</b> style object, style of paginationWrap
- <b>activePaginationStyle</b> style object, style of activePaginationStyle

#### Method
- <b>isDragging</b> return dragging or not

### Usage

#### Step 1 - install

```bash
npm install react-native-slide --save
```

#### Step 2 - import and use in project

```js
import Slide from 'react-native-slide'
	
<Slide
    height={160}
    autoPlay={5000}
    showPagination={true}
    paginationStyle={{backgroundColor: 'red'}}
    paginationWrapStyle={{}}
    activePaginationStyle={{backgroundColor: 'blue'}} >
  
  {your slide items}
</Slide>
```
