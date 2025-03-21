


function Search(){
    return (
        <div className="search-container">
            <List label={"Categories"} />
            <List label={"Items near"}
        </div>
    )

}   



function List(label){
    return (
        <div className="list-container">
            <span>{label}</span>
            <div className="item-container">
                <Item></Item>
            </div>
        </div>
    )
}

function Item({image, title}){
    return (
        <div className="item-container">
            <img className="item-icon" src={image}></img>
            <span className="item-title">{title}</span>
        </div>
    )
}