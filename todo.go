package main

// todo	可以同时触发多个实例，但是登录会不会受到互相影响，互相共享实例的token
// todo	抢红包时抢到的面额、有效期
// todo 向微信发送图片、发送链接
// _todo 日志分离到配置
// todo watch 进程 观察所有的数据情况，使用terminal Layout
// todo 由于加密限制，抢红包的加密、解密交给JS处理，http服务
// todo 幸运红包
// todo 在不需要抢的时候，通过获取信息来监控最luck的，免费赠送。
// todo kvstore的选择依据：1、内存、磁盘映射、不需要的就进入硬盘节省内存，2、分组、插入、更新、提取，主动拉出，3、支持分布式
// todo 接收到微信红包可能导致程序循环

// 扩展，其他应用，思路
// todo 可以同时触发多个实例，但是登录会不会受到互相影响，互相共享实例的token。微信登录器
// later 抢红包应用
