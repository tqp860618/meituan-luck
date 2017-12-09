package layout

import tui "github.com/gizak/termui"

type UI struct {
	Title          string
	TitleComponent *tui.Par
	Windows        []*UIWindow
	Msg            []*Msg
}
type Msg struct {
}
type UIComponent struct {
	Key   string
	value string
	Title string
}

type UIWindow struct {
	Data  []string
	Key   string
	Title string
}
