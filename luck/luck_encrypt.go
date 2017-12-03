package luck

import (
	"crypto/aes"
	"crypto/cipher"
	"fmt"
	"net/url"
	"os"
)

func DecryptAES(dst, src, key, iv []byte) error {
	aesBlockEncryptor, err := aes.NewCipher([]byte(key))
	if err != nil {
		return err
	}
	aesEncrypter := cipher.NewCFBEncrypter(aesBlockEncryptor, iv)
	aesEncrypter.XORKeyStream(dst, src)
	return nil
}
func EncryptAES(dst, src, key, iv []byte) error {
	block, err := aes.NewCipher(key)
	if err != nil {
		return err
	}
	mode := cipher.NewCBCEncrypter(block, iv)
	//fmt.Printf("%v", len(src)%16)
	mode.CryptBlocks(dst, src)
	return nil
}

func encryptTest() {
	text := `%7B"imgUrl"%3A"http%3A%2F%2Fwx.qlogo.cn%2Fmmopen%2Fvi_32%2Fs9ibvQg3vn0ka7VvHdhZbanx2icrXia9SHc2QIibmTbQ64gWKOibJDVPD3iaeQeLiaHzeqgaL9q95dFFyo57pmjh8VbRw%2F0"%2C"nickname"%3A"devctang"%2C"openId"%3A"ow2ouuOICzQcF6d2_Y5ybgS0HBbo1"%7D`
	text, _ = url.QueryUnescape(text)
	input := []byte(text)
	key := []byte("240789B06A4D4FAG")
	iv := []byte("1513D520B9C1459C")[:aes.BlockSize]

	size := int(len(input)/aes.BlockSize)*aes.BlockSize + aes.BlockSize
	encrypted := make([]byte, size)
	inputSized := make([]byte, size)
	copy(inputSized, input)

	EncryptAES(encrypted, inputSized, key, iv)

	fmt.Println("Output:    ", url.QueryEscape(string(encrypted)))
	os.Exit(0)
}
