package message

import (
	"errors"
	"github.com/rapidloop/skv"
)

type MsgDis struct {
	KVStore *skv.KVStore
}
type AddNewRoomResponse struct {
	*BaseResponse
	Data struct {
		RoomName string `json:"RoomName"`
	} `json:"data"`
}
type RoomMembersCountResponse struct {
	*BaseResponse
	Data struct {
		Count int `json:"count"`
	} `json:"data"`
}
type RoomListResponse struct {
	*BaseResponse
	Data struct {
		Rooms []map[string]interface{} `json:"Rooms"`
	} `json:"data"`
}

type BaseResponse struct {
	ErrMsg string `json:"errmsg"`
}

func (r *BaseResponse) IsSuccess() bool {
	return r.ErrMsg == ""
}
func (r *BaseResponse) Error() error {
	return errors.New(r.ErrMsg)
}
