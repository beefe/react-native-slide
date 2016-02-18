'use strict';

import React, {
	StyleSheet,
	PropTypes,
	View,
	Platform,
	Dimensions,
	ScrollView,
	ViewPagerAndroid
} from 'react-native';

let {width, height} = Dimensions.get('window');

export default class Slide extends React.Component{

	static propTypes = {
		height: PropTypes.number,
		autoPlay: PropTypes.number,
		loop: PropTypes.bool,
		showPagination: PropTypes.bool,
		paginationStyle: PropTypes.object,
		paginationWrapStyle: PropTypes.object,
		activePaginationStyle: PropTypes.object,
		children: PropTypes.node.isRequired,
	};

	static defaultProps = {
		loop: false,
		showPagination: true
	};

	constructor(props, context){
		super(props, context);
	}

	componentWillMount(){
		this.state = {
			index: 0,
			left: width,
			...this._getStateFromProps(this.props)
		};
	}

	shouldComponentUpdate(){
		return true;
	}
	//update state from newProps
	componentWillReceiveProps(newProps){
		let newState = this._getStateFromProps(newProps);
		this.setState(newState);
	}

	componentDidMount(){
		this.state.autoPlay && this._autoPlay();
	}

	componentWillUnmount(){
		clearTimeout(this.timer);
	}

	_getStateFromProps(props){
		let height = props.height;
		let autoPlay = props.autoPlay;
		let loop = props.loop;
		let showPagination = props.showPagination;
		let paginationStyle = props.paginationStyle;
		let paginationWrapStyle = props.paginationWrapStyle;
		let activePaginationStyle = props.activePaginationStyle;
		let children = props.children;
		return {
			height,
			autoPlay,
			loop,
			showPagination,
			paginationStyle,
			paginationWrapStyle,
			activePaginationStyle,
			children
		}
	}

	_createPagination(){
		let paginations = [];
		let len = React.Children.count(this.state.children);
		let paginationStyle = null;
		for(let i=0;i<len;i++){
			//active
			if(i === this.state.index){
				paginationStyle = [styles.activePaginationStyle, this.state.activePaginationStyle];
			}
			//normal
			else{
				paginationStyle = [styles.pagination, this.state.paginationStyle]
			}
			paginations.push(
				React.createElement(
					React.View,
					{
						key: i,
						style: paginationStyle
					},
					null
				)
			);
		}
		return paginations;
	}

	_autoPlay(){
		var interval = this.state.autoPlay;
		this.timer = setTimeout(() => {
			if(Platform.OS === 'ios'){
				this.setState({
					index: this.state.index + 1
				});
				this.scrollView.scrollTo({
					x: width*(this.state.index+1),
					y: 0
				});
			}
			else{
				let index = this.state.index;
				//end of right
				if(index >= React.Children.count(this.state.children)-1){
					index = -1;
					interval = 0;
				}
				else{
					index = this.state.index;
					interval = this.state.autoPlay;
				}
				this.setState({
					index: index + 1
				});
				this.scrollView.setPage(this.state.index);
			}
			this._autoPlay();
		}, interval);
	}

	_getChildren(){
		let len = React.Children.count(this.state.children);
		let children = React.Children.map(this.state.children, (child, index) => {
			//ViewPagerAndroid requires children are <View>s and not composite components
			return <View style={{width: width}} key={index}>{child}</View>
		});
		//clone last child to the left of first child and first child to the right of last child to loop the slide
		let front = React.cloneElement(
			children[len - 1],
			{
				key: -1,
				...children[len - 1].props
			},
			children[len - 1].props.children
		);
		let behind = React.cloneElement(
			children[0],
			{
				key: len,
				...children[0].props
			},
			children[0].props.children
		);
		//todo: android support loop
		return Platform.OS === 'ios' ? [front, ...children, behind] : children;
	}

	_moveEnd(index){
		let len = React.Children.count(this.state.children);
		let modifiedIndex;
		//更新state中的index是为了更新圆点，更新left是为了ios滚到边界的时候重置位置
		if(Platform.OS === 'ios'){
			//end of left
			if(index <= -1){
				modifiedIndex = len - 1;
			}
			//end of right
			else if(index >=len){
				modifiedIndex = 0;
			}
			else{
				modifiedIndex = index;
			}
			this.setState({
				index: modifiedIndex,
				left: (modifiedIndex+1)*width
			});
		}
		else{
			this.setState({
				index: index
			});
		}
	}

	render(){
		//first come may have no child, such as async get child
		if(!React.Children.count(this.state.children)){//this.state.children.length?
			return false;
		}
		let state = this.state;
		//pagination
		let paginationView = state.showPagination ?
			React.createElement(
				React.View, 
				{style: [styles.paginationWrap, state.paginationWrapStyle]},
				this._createPagination()
			) : null;
		//slide
		let tempTimer;
		let scrollView = Platform.OS === 'ios' ?
		(<ScrollView
			horizontal
			pagingEnabled
			ref={scrollView => this.scrollView = scrollView}
			style={styles.scrollView}
			contentContainerStyle={styles.contentContainerStyle}
			contentOffset={{x: state.left, y: 0}}
			onScroll={e => {

			}}
			onMomentumScrollBegin={e => {
				//todo: when user touched, then stop autoPlay, and wait for another autoPlay interval
				// clearTimeout(tempTimer);
				// tempTimer = setTimeout(() => {
				// 	state.autoPlay && this._autoPlay();
				// }, state.autoPlay);
			}}
			onMomentumScrollEnd={e => {
				let offsetX = e.nativeEvent.contentOffset.x;
				let index = Math.ceil((offsetX - width)/width);
				this._moveEnd(index);
			}}
			scrollEventThrottle={16}
			showsHorizontalScrollIndicator={false}
			scrollEnable={true}
			directionalLockEnabled={true}
			alwaysBounceVertical={false}>
			{this._getChildren()}
		</ScrollView>) :
		(<ViewPagerAndroid
			ref={scrollView => this.scrollView = scrollView}
			style={styles.scrollView}
			initialPage={0}
			onPageScroll={e => {
				//this will trigger all the time when the view is sliding, but stops at e.nativeEvent.offset=0
				let {offset, position} = e.nativeEvent;
				if(offset === 0){
					this._moveEnd(position);
				}
			}}
			//user action
			onPageSelected={e => {
				
			}}>
			{this._getChildren()}
		</ViewPagerAndroid>);
		// React.Children.map(this.props.children, child=>{
		// 	console.log(child);
		// });
		return (
			<View style={[styles.container, {
				height: this.state.height
			}]}>
				{scrollView}
				{paginationView}
			</View>
		);
	}
};

let styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	contentContainerStyle: {
		flex: 1,
	},
	container: {
		position: 'relative'
	},
	paginationWrap: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 10,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		backgroundColor: 'transparent'
	},
	pagination: {
		backgroundColor: '#fff',
		opacity: .6,
		width: 8,
		height: 8,
		borderRadius: 4,
		marginLeft: 3,
		marginRight: 3,
		marginTop: 3,
		marginBottom: 3
	},
	activePaginationStyle: {
		backgroundColor: '#000',
		opacity: 0.6,
		width: 8,
		height: 8,
		borderRadius: 4,
		marginLeft: 3,
		marginRight: 3,
		marginTop: 3,
		marginBottom: 3
	}
});