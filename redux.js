const createStore = (reducer, initialState) => {
  let currentState = initialState
  const listeners = []

  const getState = () => currentState
  const dispatch = action => {
    currentState = reducer(currentState, action)
    listeners.forEach(listener => listener())
  }

  const subscribe = listener => {
    listeners.push(listener)
    return ()=>listeners.filter(fn=>fn!==listener)
  }
  
  return { getState, dispatch, subscribe }
}

const connect = (mapStateToProps, mapDispatchToProps) =>
  Component => {
    return class extends React.Component {
      
      static contextTypes = {
         store: React.PropTypes.object
      }
    
      render() {
        const { store } = this.context;
        return (
          <Component
            {...mapStateToProps(store.getState())} 
            {...this.props}
            {...mapDispatchToProps(store.dispatch)}
          /> 
        )
      }

      componentDidMount() {
        this.context.store.subscribe(this.handleChange)
      }

      handleChange = () => {
        this.forceUpdate()
      }
    }
  }

class Provider extends React.Component {
  static childContextTypes = {
    store: React.PropTypes.object
  }
  
  getChildContext() {
    return { store: this.props.store }
  }
  
  render() {
    return this.props.children
  }
}

// APP

// actions
const ADD_TODO = 'ADD_TODO'

// action creators
const addTodo = todo => ({
  type: ADD_TODO,
  payload: todo,
})

// reducers
const reducer = (state = [], action) => {
  switch(action.type) {
    case ADD_TODO:
      return state.concat(action.payload)
    default:
      return state
  }
}

// components
class ToDoComponent extends React.Component {
  state = {
    todoText: ''
  }

  render() {
    return (
      <div>
        <label>{this.props.title || 'Без названия'}</label>
        <div>
          <input
            value={this.state.todoText}
            placeholder="Название задачи"
            onChange={this.updateText.bind(this)}
          />
          <button onClick={this.addTodo.bind(this)}>Добавить</button>
          <ul>
            {this.props.todos.map((todo, idx) => <li key={idx}>{todo}</li>)}
          </ul>
        </div>
      </div>
    )
  }

  updateText(e) {
    const { value } = e.target

    this.setState({ todoText: value })
  }

  addTodo() {
    this.props.addTodo(this.state.todoText)

    this.setState({ todoText: '' })
  }
}

const ToDo = connect( (state) => ({
    todos: state
  })
, dispatch => ({
  addTodo: text => dispatch(addTodo(text)),
}))(ToDoComponent)

// init
ReactDOM.render(
  <Provider store={ createStore(reducer, []) }>
    <ToDo title="Список задач" /> 
  </Provider>,
  document.getElementById('app')
) 
